import { initializeApp, getApps, cert } from "firebase-admin/app";
import serviceAccount from "./go-platform-7960b-firebase-adminsdk-fbsvc-dfb34e16d3.json";

export function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  }

  return getApps()[0];
}
