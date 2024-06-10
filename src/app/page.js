"use client";
import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { collection, doc, getDoc } from "firebase/firestore";
import { realtimeDb, db } from "../firebase";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import MobxStore from "@/mobx";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const getRandomColor = () => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const EntryDetails = ({ entries, contest, users }) => {
  return (
    <ul>
      {entries.map((entry, index) => {
        const userColor = getRandomColor();
        const userTicketsPercent =
          (entry.ticketAmount /
            Math.max(...entries.map((e) => e.ticketAmount))) *
          100;
        const winningChance =
          ((entry.ticketAmount * contest.entryFee) / contest.total) * 100;

        return (
          <li key={index} className="border p-2 rounded mt-1">
            <span
              className={`inline-block w-4 h-4 rounded-full ${userColor} mr-2`}
            ></span>
            <div className="flex justify-between">
              <div> {users[entry.userID]?.username || entry.userID}</div>
              <div className="text-sm text-gray-400">
                {" "}
                {formatTimeAgo(new Date(entry.datetime))} ago
              </div>
            </div>
            -{" "}
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

  const handleEnterContest = async () => {
    if (ticketQty * selectedContest.entryFee > userBalance) return;

    const newEntry = {
      datetime: new Date().toISOString(),
      userID: MobxStore.user.id,
      ticketAmount: ticketQty,
    };
    console.log({ selectedContest });
    const contestRef = ref(realtimeDb, `contests/${selectedContest.id}`);
    await set(contestRef, {
      ...selectedContest,
      entries: [...selectedContest.entries, newEntry],
      accumulated:
        selectedContest.accumulated + ticketQty * selectedContest.entryFee,
    });

    setShowModal(false);
    setTicketQty(1);
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
        const contestsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

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

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Contests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map((contest) => {
          const product = products[contest.productId];
          const accumulatedPercent =
            (contest.accumulated / contest.total) * 100;

          return (
            <Card key={contest.id} className="shadow-md rounded-lg p-4">
              <Image
                src={product?.image}
                alt={product?.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <h2 className="text-xl font-semibold mt-2">{product?.name}</h2>
              <div className="flex gap-2 items-center w-full justify-between">
                <p className="text-gray-700">Total Goal: ${contest.total}</p>
                <p className="text-gray-700">Entry Fee: ${contest.entryFee}</p>
              </div>

              <button className="bg-blue-500 text-white py-2 px-4 rounded mt-2">
                Enter - ${contest.entryFee}
              </button>
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
              <div className="mt-4">
                <h3 className="text-lg font-medium">Top Entries</h3>
                <EntryDetails
                  entries={[...contest.entries]
                    .sort((a, b) => b.ticketAmount - a.ticketAmount)
                    .slice(0, 3)}
                  contest={contest}
                  users={users}
                />

                <details className="mt-2">
                  <summary className="text-blue-500 cursor-pointer">
                    See all entries
                  </summary>
                  <EntryDetails
                    entries={contest.entries}
                    users={users}
                    contest={contest}
                  />
                </details>
              </div>

              <Dialog>
                <DialogTrigger>
                  <Button
                    onClick={() => {
                      setSelectedContest(contest);
                      setShowModal(true);
                    }}
                    className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
                  >
                    Enter - ${contest.entryFee}
                  </Button>
                </DialogTrigger>
                {showModal && selectedContest && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-background p-6 rounded shadow-lg w-96">
                      <h2 className="text-2xl font-semibold mb-4">
                        Enter this contest
                      </h2>
                      <p>How many tickets would you like to buy?</p>
                      <div className="flex items-center mt-4 mb-4">
                        <button
                          onClick={() =>
                            setTicketQty(Math.max(1, ticketQty - 1))
                          }
                          className="px-4 py-2  rounded-l"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={ticketQty}
                          onChange={(e) =>
                            setTicketQty(Math.max(1, Number(e.target.value)))
                          }
                          className="w-full text-center border-t border-b border-gray-200"
                        />
                        <button
                          onClick={() => setTicketQty(ticketQty + 1)}
                          className="px-4 py-2  rounded-r"
                        >
                          +
                        </button>
                      </div>
                      <p>Current Balance: ${userBalance}</p>
                      <p>
                        Total Price: ${ticketQty * selectedContest.entryFee}
                      </p>
                      {ticketQty * selectedContest.entryFee > userBalance && (
                        <p className="text-red-500">Insufficient funds</p>
                      )}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setShowModal(false)}
                          className="mr-2 px-4 py-2 bg-gray-300 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEnterContest}
                          className={`px-4 py-2 rounded ${
                            ticketQty * selectedContest.entryFee > userBalance
                              ? "bg-gray-300"
                              : "bg-blue-500 text-white"
                          }`}
                          disabled={
                            ticketQty * selectedContest.entryFee > userBalance
                          }
                        >
                          Enter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
