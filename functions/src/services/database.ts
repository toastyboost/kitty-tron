import * as admin from "firebase-admin";

type Get = {
  url: string;
}

type Post<T> = {
  url: string;
  body: T;
}

type Put<T> = {
  url: string;
  child: string;
  body: T;
}

type Delete = {
  url: string;
  child: string;
}

export const db = {
  get: async <T extends unknown>({ url }: Get) => {
    let result = {}
    await admin.database().ref(url).once("value", (snapshot) => {
      result = snapshot.val();
    });
    return result as T;
  },
  post: async <T extends {}>({ url, body }: Post<T>) => {
    return await admin.database().ref(url).set(body, (error) => {
      if (error) console.log('Data could not be saved. ' + error);
    })
  },
  put: async <T extends {}>({ url, child, body }: Put<T>) => {
    await admin.database().ref(url).child(child).update(body)
  },
  delete: async ({ url, child }: Delete) => {
    return await admin.database().ref(url).child(child).remove((error) => {
      if (error) console.log('Data could not be deleted. ' + error);
    })
  },
  push: async <T extends any>({ url, body }: Post<T>) => {
    return await admin.database().ref(url).set(body, (error) => {
      if (error) console.log('Data could not be saved. ' + error);
    })
  }
};

