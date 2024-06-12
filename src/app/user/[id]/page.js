"use client";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { observer } from "mobx-react-lite";
import { useParams, useRouter } from "next/navigation";
import MobxStore from "@/mobx";
import { db } from "@/firebase";

const Profile = observer(() => {
  const router = useRouter();

  const userId = useParams().id;
  const { user: loggedInUser } = MobxStore;
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState({});
  const [userStats, setUserStats] = useState({
    totalContests: 0,
    totalWon: 0,
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId === loggedInUser?.uid) {
        setUser(loggedInUser);
        setUserStats({
          totalContests: loggedInUser.totalContests || 0,
          totalWon: loggedInUser.contestsWon || 0,
        });
      } else {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          setUserStats({
            totalContests: userData.totalContests || 0,
            totalWon: userData.contestsWon || 0,
          });
        }
      }
    };

    const fetchUserLogs = async () => {
      if (!userId) return;

      const logsRef = collection(db, "logs");
      const querySnapshot = await getDocs(logsRef);
      const logsData = [];

      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        const userEntries = Object.values(logData.entries).filter(
          (entry) => entry.userID === userId
        );
        if (userEntries.length > 0) {
          logsData.push({ ...logData, userEntries });
        }
      });

      setLogs(logsData);

      // Fetch product details
      const productPromises = logsData.map(async (log) => {
        const productRef = doc(db, "products", log.productId);
        const productSnap = await getDoc(productRef);
        return { [log.productId]: productSnap.data() };
      });

      const productData = await Promise.all(productPromises);
      const productMap = Object.assign({}, ...productData);
      setProducts(productMap);
    };

    if (userId) {
      fetchUserDetails();
      fetchUserLogs();
    }
  }, [userId, loggedInUser]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-semibold mb-4">{user.username}</h2>
        <p className="text-gray-700">
          Total Contests: {userStats.totalContests}
        </p>
        <p className="text-gray-700">Contests Won: {userStats.totalWon}</p>
        <p className="text-gray-700">
          Color:{" "}
          <span
            style={{ backgroundColor: user.color }}
            className="inline-block w-4 h-4 rounded-full"
          ></span>
        </p>
      </div>
      <h3 className="text-2xl font-semibold mt-6 mb-4">Contest History</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logs.map((log, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-2">
              Contest {log.contestId}
            </h4>
            <p className="text-gray-700">
              Product: {products[log.productId]?.name}
            </p>
            <p className="text-gray-700">Total: ${log.total}</p>
            <p className="text-gray-700">Accumulated: ${log.accumulated}</p>
            <p className="text-gray-700">
              Winner: {log.winnerUserId === userId ? "You" : log.winnerUserId}
            </p>
            <p className="text-gray-700">
              Date: {new Date(log.datetime).toLocaleString()}
            </p>
            <div className="mt-4">
              <h5 className="text-lg font-medium">Entries:</h5>
              <ul>
                {Object.values(log.entries).map((entry, idx) => (
                  <li key={idx} className="text-gray-600">
                    {entry.userID === userId ? "You" : entry.userID}:{" "}
                    {entry.ticketAmount} tickets
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Profile;
