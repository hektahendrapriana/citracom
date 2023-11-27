const sqlite = require('sqlite');
const sqlite3= require('sqlite3');
import type { NextApiRequest, NextApiResponse } from 'next'
import Config from '@/libs/Config';
import {open} from 'sqlite';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
type ProductDto = {
  id: number
  nama: string
  deskripsi: string
  harga: number
  stok: number
  foto: string
  suplier_id: number
  nama_suplier: string
}

type ResponseData = {
  message: string
  data: ProductDto[]
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

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  
  const payloadBody = {
    nama: body.nama,
    deskripsi: body.deskripsi,
    harga: body.harga,
    stok: body.stok,
    foto: body.foto,
    suplier_id: body.suplier_id
  }

  console.log('payloadBody', payloadBody)
  const db = await open(
    {filename: dbFile , driver: sqlite3.Database}
  );
  if( db )
  {
    switch (req.method) {
      case 'GET':
        var products = {}
        if( typeof query.id === undefined || typeof query.id === 'undefined' || query.id === '' )
        {
          products = await db.all("SELECT id, nama, deskripsi, harga, stok, foto, suplier_id, nama_suplier FROM produk INNER JOIN suplier ON produk.suplier_id = suplier.id_suplier");
        }
        else{
          products = await db.all("SELECT id, nama, deskripsi, harga, stok, foto, suplier_id, nama_suplier FROM produk INNER JOIN suplier ON produk.suplier_id = suplier.id_suplier WHERE id=?", query.id);
        }
        console.log(products);
        
        res.status(200).json({ 
          code: 200,
          message: "Successful Get Products",
          data: products,
        });
        break;
  
      case 'POST':
        await db.run("INSERT INTO produk (nama, deskripsi, harga, stok, foto, suplier_id) VALUES (?,?,?,?,?,?)", 
          body.nama, 
          body.deskripsi, 
          body.harga, 
          body.stok, 
          body.foto, 
          body.suplier_id
        );
        res.status(201).json({
          code: 201,
          message: "Successful Add Product",
          data: payloadBody,
        })
        break;

        case 'PATCH':
          await db.run("UPDATE produk SET nama=?, deskripsi=?, harga=?, stok=?, foto=?, suplier_id=? WHERE id = ?", 
            body.nama, 
            body.deskripsi, 
            body.harga, 
            body.stok, 
            body.foto, 
            body.suplier_id, 
            query.id
          );

          res.status(201).json({
            code: 201,
            message: "Successful Update Product",
            data: payloadBody,
          })
          break;

        case 'DELETE':
          await db.run("DELETE from produk WHERE id = ?", query.id);
          res.status(201).json({
            code: 201,
            message: "Successful Delete Product",
            data: payloadBody,
          })
          break;

      default:
          res.status(405).json({
              code: 405,
              message: "Method Not Allowed",
              data: []
            });
          break;
      }
  }
  else{
    res.status(405).json({
      code: 405,
      message: "DB Not Connected",
      data: []
    });
  }
}
