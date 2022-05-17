import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as brain from 'brain.js'
import fetch from 'node-fetch';
import { uid } from "uid"

// init

admin.initializeApp(functions.config().firebase);

const network = new brain.recurrent.LSTM();

const trainOptions = { iterations: 400, log: true };

const data = [{ "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "пояс", "output": "c659" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "накладной карман", "output": "6597" }, { "input": "карман с листочкой с втачными концами", "output": "597f" }, { "input": "карман с листочкой с втачными концами", "output": "597f" }, { "input": "карман с листочкой с втачными концами", "output": "597f" }, { "input": "карман с листочкой с втачными концами", "output": "597f" }, { "input": "карман с листочкой с втачными концами", "output": "597f" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "прорезной карман с клапаном", "output": "97f5" }, { "input": "пуговицы", "output": "7f5f" }, { "input": "пуговицы", "output": "7f5f" }, { "input": "пуговицы", "output": "7f5f" }, { "input": "пуговицы", "output": "7f5f" }, { "input": "пуговицы", "output": "7f5f" }]
network.train(data, trainOptions)

import { db } from "./services/database"

import {
  Operation,
  Accordance,
  ExcelTable
} from "./models"

// api

export const init = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (_, response) => {


})

export const operations = functions.https.onRequest(async (request, response) => {

  const { query } = request

  const ersResponse = network.run(query.find as unknown as string)
  const ops = await db.get<Operation[]>({ url: '/operations' })
  const result = ops.filter(operation => ersResponse.includes(operation.id))

  response.json({ result })
});

export const accordances = functions.https.onRequest(async (_, response) => {
  const result = await db.get<Accordance[]>({ url: '/accordances' });
  response.json({ result })
});

export const exportOperations = functions.https.onRequest(async (_, response) => {
  const ACCESS_TOKEN =
    "ya29.A0ARrdaM-Dc8SY3H774QXVp9qtvNqymiQk1ypFshQBEeAxqY_u34LTCHuHpRy67-eLGMbIUckagLxwHtRd5OXwb7NJ80-5S3YMn3-GW-abGhDIbrjS2xoUVCBsp7XPXaxccTTNw9Dv4Fq-niInX9BZGuD9nVHD";

  const result = await fetch(`https://docs.google.com/spreadsheets/d/1bpnUAbssvQBpO752kEfySaEg2f3-dRsSV6Z5Xg5nXTs/gviz/tq?tqx=out:json/edit#gid=1520698568`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    }
  });

  const text = await result.text() as any

  const data = JSON.parse(text.match(/(?<=.*\().*(?=\);)/s)[0]) as ExcelTable

  const operations: Operation[] = []
  const accordance: Accordance[] = []

  let key = 0;
  let tag = ''
  let id = '';

  for (const row of data.table.rows) {

    if (row.c[0]?.v) {
      tag = String(row.c[0].v).trim().toLowerCase()
      id = uid(4)
      key = 0
    }

    const name = row.c[1] ? String(row.c[1].v).toLowerCase().trim() : ""

    operations.push({
      id,
      name,
      activity: row.c[2] ? String(row.c[2].v).toLowerCase().trim() : "",
      scope: row.c[3] ? String(row.c[3].v).toLowerCase().trim() : "",
      executionTime: row.c[4] ? Number(row.c[4].v) : 0,
      equipment: row.c[5] ? String(row.c[5].v).toLowerCase().trim() : "",
      queue: key
    })

    accordance.push({
      input: tag,
      output: id,
    })

    key++
  }

  await db.post({ url: '/operations', body: operations })
  await db.post({ url: '/accordances', body: accordance })

  response.json({ operations, accordance })
});

