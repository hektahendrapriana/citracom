const sqlite = require('sqlite');
const sqlite3= require('sqlite3');
import type { NextApiRequest, NextApiResponse } from 'next'
import Config from '@/libs/Config';
import {open} from 'sqlite';


type SuplierDto = {
  id_suplier: number
  nama_suplier: string
  alamat: string
  email: string
}

type ResponseData = {
  message: string
  data: SuplierDto[]
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500kb',
    },
  },
}

export default async function handler( req: NextApiRequest, res: NextApiResponse ){
  var dbFile = Config.get_config().DbFileName;
  const query = req.query;
  const body = req.body

  const payloadBody = {
    nama_suplier: body.nama_suplier,
    alamat: body.alamat,
    email: body.email
  }

  console.log('query', query)
  console.log('payloadBody', payloadBody)
  const db = await open(
    {filename: dbFile , driver: sqlite3.Database}
  );
  if( db )
  {
    switch (req.method) {
      case 'GET':
        var supliers = {}
        if( typeof query.id === undefined || typeof query.id === 'undefined' || query.id === '' )
        {
          supliers = await db.all("SELECT id_suplier, nama_suplier, alamat, email FROM suplier");
        }
        else{
          supliers = await db.all("SELECT id_suplier, nama_suplier, alamat, email FROM suplier where id_suplier=?", query.id);
        }
        console.log('supliers', supliers);

        res.status(200).json({ 
          message: "Successful Get Suplier",
          data: supliers,
        });
        break;
  
      case 'POST':
        await db.run("INSERT INTO suplier (nama_suplier, alamat, email) VALUES (?,?,?)", 
          body.nama_suplier, 
          body.alamat, 
          body.email
        );

        res.status(201).json({
          message: "Successful Add Suplier",
          data: payloadBody,
        })
        break;

        case 'PATCH':
          await db.run("UPDATE suplier SET nama_suplier=?, alamat=?, email=? WHERE id_suplier = ?", 
            body.nama_suplier, 
            body.alamat, 
            body.email, 
            query.id
          );

          res.status(201).json({
            message: "Successful Update Suplier",
            data: payloadBody,
          })
          break;

        case 'DELETE':
          await db.run("DELETE from suplier WHERE id_suplier = ?", query.id);
          res.status(201).json({
            message: "Successful Delete Suplier",
            data: payloadBody,
          })
          break;

      default:
          res.status(405).json({
              message: "Method Not Allowed",
              data: []
            });
          break;
      }
  }
  else{
    res.status(405).json({
      message: "DB Not Connected",
      data: []
    });
  }
}
