"use client";
import { useEffect, useState } from "react";
import { ref, onValue, set, push, get, update } from "firebase/database";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { realtimeDb, db } from "../firebase";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Ticket, X } from "lucide-react";
import MobxStore from "@/mobx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { runInAction } from "mobx";

export const pickWinner = (entries) => {
  const ticketPool = [];
  entries.forEach((entry) => {
    for (let i = 0; i < entry.ticketAmount; i++) {
      ticketPool.push(entry.userID);
    }
  });
  const winnerIndex = Math.floor(Math.random() * ticketPool.length);
  return ticketPool[winnerIndex];
};

const formatTimeAgo = (date) => {
  const distance = formatDistanceToNow(date, { addSuffix: true });
  return distance
    .replace("about ", "")
    .replace(" hours", "h")
    .replace(" days", "d")
    .replace(" minutes", "m")
    .replace(" seconds", "s")
    .replace(" ago", "");
};

const EntryDetails = ({ entries, contest, users }) => {
  return (
    <ul>
      {entries.map((entry, index) => {
        const userTicketsPercent =
          (entry.ticketAmount /
            Math.max(...entries.map((e) => e.ticketAmount))) *
          100;
        const winningChance =
          ((entry.ticketAmount * contest.entryFee) / contest.total) * 100;

        return (
          <li key={index} className="border p-2 rounded mt-1">
            <div className="flex justify-between">
              <div className="flex items-center">
                <span
                  style={{ backgroundColor: users[entry.userID]?.color }}
                  className={`inline-block w-4 h-4 rounded-full mr-2`}
                ></span>{" "}
                <Link className="underline" href={`/user/${entry.userID}`}>
                  {users[entry.userID]?.username || entry.userID}
                </Link>
              </div>
              <div className="text-sm text-gray-400">
                {formatTimeAgo(new Date(entry.datetime))} ago
              </div>
            </div>

            <div className="flex mb-2 items-center justify-between mt-2">
              <div className="flex w-fit text-xs items-center gap-2 font-semibold  py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {winningChance.toFixed(2)}%
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {entry.ticketAmount} x Tickets
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${userTicketsPercent}%` }}
                ></div>
              </div>

              {/* <span className="ml-2 text-xs">
              {winningChance.toFixed(2)}%
            </span> */}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [products, setProducts] = useState({});
  const [users, setUsers] = useState({});

  const userBalance = MobxStore.user?.balance || 0;

  const [selectedContest, setSelectedContest] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getProductName = (productId) => {
    return products[productId]?.name || "Product";
  };

  const handleContestCompletion = async (contestId) => {
    // Get contest details
    const contestRef = ref(realtimeDb, `contests/${contestId}`);
    const contestSnapshot = await get(contestRef);
    const contestData = contestSnapshot.val();

    // Determine the winner
    const winnerUserId = pickWinner(Object.values(contestData.entries));
    console.log({ winnerUserId });

    // Update contest status
    await update(contestRef, {
      status: "finished",
    });

    // Create log in Firestore
    const logData = {
      contestId,
      productId: contestData.productId,
      winnerUserId,
      entries: contestData.entries,
      total: contestData.total,
      accumulated: contestData.accumulated,
      entryFee: contestData.entryFee,
      datetime: new Date().toISOString(),
    };
    console.log({ logData });
    const logsCollectionRef = collection(db, "logs");
    await addDoc(logsCollectionRef, logData);

    // Update user stats
    const updateUserStats = async (userId, isWinner) => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await updateDoc(userRef, {
          totalContests: (userData.totalContests || 0) + 1,
          contestsWon: isWinner
            ? (userData.contestsWon || 0) + 1
            : userData.contestsWon || 0,
        });
      }
    };

    // Update stats for all participants
    const allUserIds = Object.values(contestData.entries).map(
      (entry) => entry.userID
    );
    const uniqueUserIds = [...new Set(allUserIds)];
    await Promise.all(
      uniqueUserIds.map((userId) =>
        updateUserStats(userId, userId === winnerUserId)
      )
    );
  };

  const handleEnterContest = async () => {
    if (ticketQty * selectedContest.entryFee > userBalance) return;

    const maxTickets = Math.floor(
      (selectedContest.total - selectedContest.accumulated) /
        selectedContest.entryFee
    );

    if (ticketQty > maxTickets) {
      console.log("Cannot buy more tickets than available.");
      return;
    }

    const userId = MobxStore.user.uid;

    if (!userId) {
      console.log("User ID is undefined");
      return;
    }

    const contestRef = ref(
      realtimeDb,
      `contests/${selectedContest.id}/entries`
    );
    const entriesSnapshot = await get(contestRef);
    const entriesData = entriesSnapshot.val() || {};

    let existingEntryKey = null;
    let existingEntry = null;

    // Check if an entry for the user already exists
    for (const key in entriesData) {
      if (entriesData[key].userID === userId) {
        existingEntryKey = key;
        existingEntry = entriesData[key];
        break;
      }
    }

    if (existingEntry) {
      // Update the existing entry
      const updatedEntry = {
        ...existingEntry,
        datetime: new Date().toISOString(),
        ticketAmount: existingEntry.ticketAmount + ticketQty,
      };
      await set(
        ref(
          realtimeDb,
          `contests/${selectedContest.id}/entries/${existingEntryKey}`
        ),
        updatedEntry
      );
    } else {
      // Create a new entry
      const newEntry = {
        datetime: new Date().toISOString(),
        userID: userId,
        ticketAmount: ticketQty,
      };
      const newEntryRef = push(contestRef);
      await set(newEntryRef, newEntry);
    }

    // Update the accumulated amount
    const accumulatedRef = ref(
      realtimeDb,
      `contests/${selectedContest.id}/accumulated`
    );
    await set(
      accumulatedRef,
      selectedContest.accumulated + ticketQty * selectedContest.entryFee
    );

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      balance: userBalance - ticketQty * selectedContest.entryFee,
    });
    runInAction(() => {
      MobxStore.user.balance =
        userBalance - ticketQty * selectedContest.entryFee;
    });

    setShowModal(false);
    setTicketQty(1);

    // trigger end of contest
    const newAccumulated =
      selectedContest.accumulated + ticketQty * selectedContest.entryFee;
    console.log(123, newAccumulated, selectedContest.total);
    if (newAccumulated >= selectedContest.total) {
      await handleContestCompletion(selectedContest.id);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async (userIds) => {
      const userPromises = userIds.map(async (userId) => {
        const userRef = doc(collection(db, "users"), userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          return { [userId]: userSnap.data() };
        } else {
          return { [userId]: {} };
        }
      });

      const userData = await Promise.all(userPromises);
      const userMap = Object.assign({}, ...userData);
      setUsers(userMap);
    };

    const contestsRef = ref(realtimeDb, "contests");
    onValue(contestsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contestsArray = Object.keys(data).map((key) => {
          const contest = data[key];
          return {
            id: key,
            ...contest,
            entries: contest.entries ? Object.values(contest.entries) : [],
          };
        });

        const productPromises = contestsArray.map(async (contest) => {
          const productRef = doc(collection(db, "products"), contest.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            return { [contest.productId]: productSnap.data() };
          } else {
            return { [contest.productId]: {} };
          }
        });

        const productData = await Promise.all(productPromises);
        const productMap = Object.assign({}, ...productData);
        setProducts(productMap);
        setContests(contestsArray);

        const userIds = [
          ...new Set(
            contestsArray.flatMap((contest) =>
              contest.entries.map((entry) => entry.userID)
            )
          ),
        ];
        fetchUserDetails(userIds);
      }
    });
  }, []);

  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Contests</h1>
      {productId && (
        <div className="my-4">
          <Badge
            className="cursor-pointer"
            onClick={() =>
              router.replace("/", undefined, {
                shallow: true,
              })
            }
          >
            {getProductName(productId)}
            <div className="ml-2 w-4 h-4 flex items-center justify-center rounded-full border border-transparent  cursor-pointer transition duration-300">
              <X size="14px" />
            </div>
          </Badge>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => {
          const product = products[contest.productId];
          const accumulatedPercent =
            (contest.accumulated / contest.total) * 100;

          const entriesArray = contest?.entries
            ? Object.values(contest.entries)
            : [];

          const maxTicketsByBalance = Math.floor(
            userBalance / selectedContest?.entryFee
          );
          const maxTicketsAvailable = Math.floor(
            (selectedContest?.total - selectedContest?.accumulated) /
              selectedContest?.entryFee
          );
          const maxTickets = Math.min(maxTicketsByBalance, maxTicketsAvailable);

          return (
            <Card key={contest.id} className="shadow-md rounded-lg p-4">
              <Image
                src={product?.image}
                alt={product?.name}
                width={300}
                height={200}
                className="w-auto h-48 object-cover rounded-t-lg"
              />
              <h2 className="text-xl font-semibold mt-2">{product?.name}</h2>
              <div className="flex gap-2 items-center w-full justify-between">
                <p className="text-gray-700">Total Goal: ${contest.total}</p>
                <p className="text-gray-700">Entry Fee: ${contest.entryFee}</p>
              </div>
              <p className="text-gray-700">
                Tickets Left: x
                {(contest.total - contest.accumulated) / contest.entryFee}
              </p>

              <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign in to enter contest</DialogTitle>
                    <DialogDescription>
                      You need to sign in to enter this contest
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAuthModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() =>
                        router.push("/login", undefined, { shallow: true })
                      }
                    >
                      Sign in
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle> Enter this contest</DialogTitle>
                    <DialogDescription>
                      How many tickets would you like to buy? (Max: {maxTickets}
                      )
                    </DialogDescription>
                    <div className="flex gap-4 flex-col">
                      <div className="flex items-center mt-8">
                        <button
                          onClick={() =>
                            setTicketQty((prev) => Math.max(1, prev - 1))
                          }
                          className="px-4 py-2 border rounded-l"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={ticketQty}
                          onChange={(e) => {
                            const value = Math.max(1, Number(e.target.value));
                            setTicketQty(Math.min(value, maxTickets));
                          }}
                          className="w-fit h-[42px] text-center border-t border-b border-gray-200"
                        />
                        <button
                          onClick={() =>
                            setTicketQty((prev) =>
                              Math.min(prev + 1, maxTickets)
                            )
                          }
                          className="px-4 py-2 border rounded-r"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => setTicketQty(maxTickets)}
                        className="px-4 py-2 mt-2 bg-blue-500 text-white rounded"
                      >
                        Buy Max ({maxTickets})
                      </button>
                      <p>Available Tickets: {maxTicketsAvailable}</p>
                      <p>Ticket Fee: ${selectedContest?.entryFee}</p>
                      <p>Your Balance: ${userBalance}</p>
                      <p>
                        Total Price: ${ticketQty * selectedContest?.entryFee}
                      </p>
                      {ticketQty * selectedContest?.entryFee > userBalance && (
                        <>
                          <p className="text-red-500">Insufficient coins</p>
                          <Button>+ Buy Coins</Button>
                        </>
                      )}
                    </div>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEnterContest}
                      disabled={
                        ticketQty * selectedContest?.entryFee > userBalance
                      }
                    >
                      Enter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        {accumulatedPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        ${contest.accumulated} / ${contest.total}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${accumulatedPercent}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
              {contest.status === "finished" ? (
                <div className="p-2 uppercase rounded bg-yellow-200 text-yellow-700 text-xs text-center">
                  finished
                </div>
              ) : (
                <Button
                  onClick={() => {
                    if (!MobxStore.user) {
                      return setShowAuthModal(true);
                    }

                    setSelectedContest(contest);
                    setShowModal(true);
                  }}
                  className="w-full mt-2"
                >
                  Enter - ${contest.entryFee}
                </Button>
              )}

              <div className="mt-4">
                {/* <h3 className="text-lg font-medium">Top Entries</h3>
                <EntryDetails
                  entries={entriesArray
                    .sort((a, b) => b.ticketAmount - a.ticketAmount)
                    .slice(0, 3)}
                  contest={contest}
                  users={users}
                /> */}

                <details className="mt-2">
                  <summary className="text-blue-500 cursor-pointer">
                    See Entries
                  </summary>
                  <EntryDetails
                    entries={entriesArray}
                    contest={contest}
                    users={users}
                  />
                </details>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
