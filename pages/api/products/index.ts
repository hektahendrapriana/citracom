const sqlite = require('sqlite');
const sqlite3= require('sqlite3');
import type { NextApiRequest, NextApiResponse } from 'next'
import Config from '@/libs/Config';
import {open} from 'sqlite';
import { IncomingForm } from 'formidable'
import { promises as fs } from 'fs'

var mv = require('mv');

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
    // bodyParser: {
    //   sizeLimit: '2mb',
    // },
    bodyParser: false,
  },
}

export default async function handler( req: NextApiRequest, res: NextApiResponse ){
  var dbFile = Config.get_config().DbFileName;
  var UPLOAD_PATH = Config.get_config().UPLOAD_PATH;
  var limitedFile = Config.get_config().limitedFile;
  const query = req.query;
  const body = req.body

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) reject({ err })
      resolve({ err, fields, files })
    }) 
  })
  var fields = {};
  var detailFiles = {};
  var payloadBody = {};
  console.log('data', data);
  console.log('fields', typeof data.fields.name);
  if( typeof data.files.upload != 'undefined' )
  {
    console.log('dsd')
    fields = data.fields;
    detailFiles = await data.files.upload[0];
    console.log('detailFiles', detailFiles.originalFilename)
    payloadBody = {
      nama: fields.nama[0],
      deskripsi: fields.deskripsi[0],
      harga: fields.harga[0],
      stok: fields.stok[0],
      foto: detailFiles.originalFilename,
      suplier_id: fields.suplier_id[0]
    }
  }

  // const payloadBody = {
  //   nama: body.nama,
  //   deskripsi: body.deskripsi,
  //   harga: body.harga,
  //   stok: body.stok,
  //   foto: body.foto,
  //   suplier_id: body.suplier_id
  // }
  
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
        if( detailFiles.size <= limitedFile )
        {
          var oldPath = detailFiles.filepath;
          var newPath = `${UPLOAD_PATH}${detailFiles.originalFilename}`;
          mv(oldPath, newPath, function() {
          });
          await db.run("INSERT INTO produk (nama, deskripsi, harga, stok, foto, suplier_id) VALUES (?,?,?,?,?,?)", 
            fields.nama[0], 
            fields.deskripsi[0], 
            fields.harga[0], 
            fields.stok[0], 
            detailFiles.originalFilename, 
            fields.suplier_id[0]
          );
          // await db.run("INSERT INTO produk (nama, deskripsi, harga, stok, foto, suplier_id) VALUES (?,?,?,?,?,?)", 
          //   body.nama, 
          //   body.deskripsi, 
          //   body.harga, 
          //   body.stok, 
          //   body.foto, 
          //   body.suplier_id
          // );
          res.status(201).json({
            code: 201,
            message: "Successful Add Product",
            data: payloadBody,
          })
        }
        else{
          res.status(405).json({
            code: 405,
            message: "Foto tidak boleh lebih besar dari 2MB",
            data: payloadBody,
          })
        }
        
        break;

        case 'PATCH':
          if( detailFiles.size <= limitedFile )
          {
            await db.run("UPDATE produk SET nama=?, deskripsi=?, harga=?, stok=?, foto=?, suplier_id=? WHERE id = ?", 
              fields.nama[0], 
              fields.deskripsi[0], 
              fields.harga[0], 
              fields.stok[0], 
              detailFiles.originalFilename, 
              fields.suplier_id[0], 
              query.id
            );
            // await db.run("UPDATE produk SET nama=?, deskripsi=?, harga=?, stok=?, foto=?, suplier_id=? WHERE id = ?", 
            //   body.nama, 
            //   body.deskripsi, 
            //   body.harga, 
            //   body.stok, 
            //   body.foto, 
            //   body.suplier_id, 
            //   query.id
            // );

            res.status(201).json({
              code: 201,
              message: "Successful Update Product",
              data: payloadBody,
            })
          }
          else{
            res.status(405).json({
              code: 405,
              message: "Foto tidak boleh lebih besar dari 2MB",
              data: payloadBody,
            })
          }
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
