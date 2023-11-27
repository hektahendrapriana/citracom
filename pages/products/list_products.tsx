"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { styled } from '@mui/material/styles';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton
} from "@mui/material";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { emit } from "process";
import Config from '@/libs/Config';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';


var API_URL = Config.get_config().BASE_URL;
var UPLOAD_URL = Config.get_config().UPLOAD_URL;
var UPLOAD_PATH = Config.get_config().UPLOAD_PATH;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const ListProducts = () => {
  const productData = {
    nama: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    foto: '',
    suplier_id: 0
  }

  const suplierData = {
    nama_suplier: '',
    alamat: '',
    email: ''
  }
  const [foto, setFoto] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const [page, setPage] = useState('product');
  const [open, setOpen] = useState(false);
  const [openSuplier, setOpenSuplier] = useState(false);
  const [listData, setListData] = useState([]);
  const [suppliers, setSuppliers] = useState([])
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState( page === 'product' ? productData : suplierData )

  useEffect(() => {
    getListProduct();
    getSuppliers();
  }, []);

  const getSuppliers = () => {
    fetch(`${API_URL}/api/supliers/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => {
      console.log(resp)
      if( resp.status === 200 )
      {
        resp.json().then((data) => {
          console.log(data)
          if(data.data.length > 0)
          {
             setSuppliers(data.data);
          }
        });
      }
      else
      {
        setSuppliers([]);
      }
    });
  }

  const getListProduct = () => {
    fetch(`${API_URL}/api/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => {
      if( resp.status === 200 )
      {
        resp.json().then((data) => {
          if(data.data.length > 0)
          {
            setListData(data.data);
          }
        });
      }
      else
      {
        setListData([]);
      }
    });
  }

  const handleEdit = (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const API_PATH = page === 'product' ? 'products' : 'supliers';
    console.log(id)

    fetch(`${API_URL}/api/${API_PATH}?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => {
      console.log(resp)
      if( resp.status === 200 )
      {
        resp.json().then((data) => {
          console.log(data)
          if(data.data.length > 0)
          {
            page === 'product' ? setOpen(true) : setOpenSuplier(true);
            setDetails(data.data[0])
          }
        });
      }
    });
  }

  const handleDelete = (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const API_PATH = page === 'product' ? 'products' : 'supliers';
    console.log(id)

    fetch(`${API_URL}/api/${API_PATH}?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((resp) => {
      setDetails(null)
      if( page === 'product' )
      {
        getListProduct();
        setFormData(productData)
      }
      else{
        getSuppliers();
        setFormData(suplierData)
      }
    });
  }
  
  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault()
    const API_PATH = page === 'product' ? 'products' : 'supliers';
    var formBody = new FormData(event.currentTarget)
    // formBody.append("foto", foto); 
    var formObject = Object.fromEntries(formBody.entries());
    console.log(formBody);
    if( details === null )
    { 
      if(page === 'product')
      {
        fetch(`${API_URL}/api/${API_PATH}`, {
          method: 'POST',
          body: formBody,
        }).then((resp) => {
          setCreateObjectURL(null)
          setFoto(null)
          setDetails(null)
          setFormData(productData);
          setOpen(false);
          getListProduct();
        });
      }
      else
      {
        fetch(`${API_URL}/api/${API_PATH}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: formBody,
        }).then((resp) => {
          setCreateObjectURL(null)
          setFoto(null)
          setDetails(null)
          setFormData(suplierData);
          setOpenSuplier(false);
          getSuppliers();
        });
      }
      
    }
    else{ 
      if(page === 'product')
      {
        fetch(`${API_URL}/api/${API_PATH}?id=${details.id}`, {
          method: 'PATCH',
          body: formBody,
        }).then((resp) => {  
          setCreateObjectURL(null)
          setFoto(null)
          setDetails(null)
          setFormData(productData);
          setOpen(false);
          getListProduct();
        });
      }
      else
      {
        fetch(`${API_URL}/api/${API_PATH}?id=${details.id_suplier}`, {
          method: 'PATCH',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formObject),
        }).then((resp) => {
          setCreateObjectURL(null)
          setFoto(null)
          setDetails(null)
          setFormData(suplierData);
          setOpenSuplier(false);
          getSuppliers();
        });
      }
    }
 
  }

  const currencyFormat = (num: number, symbol: string) => {
    return symbol + ' ' + num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  const handleClickOpen = () => {
    setCreateObjectURL(null)
    setFoto(null)
    page === 'product' ? setOpen(true) : setOpenSuplier(true);
  }

  const handleChangePage = () => {
    setPage( page === 'product' ? 'suplier' : 'product' );
  }

  const handleClose = () => {
    setCreateObjectURL(null)
    setFoto(null)
    setOpen(false);
    setOpenSuplier(false);
    setDetails(null)
  };

  
  const handleChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setFormData({...formData, [key]: value})
  }

  const handleChangeSelect = (e) => {
    console.log(e)
    const key = 'suplier_id';
    const value = e.target.value;
    setFormData({...formData, [key]: value})
  }

  const handleUploadImage = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      console.log('foto', i)
      console.log('foto', i.name)
      
      const key = 'foto';
      setFormData({...formData, [key]: i.name})
      setFoto(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  return (
    <Container maxWidth="lg">
      {/* <Link></Link> */}
      <Grid container spacing={2}>
        <Grid xs={4}><Button onClick={handleChangePage}>{ page === 'product' ? 'List Suplier' : 'List Produk'}</Button></Grid>
        {
          page === 'product' ?
          <Grid xs={4}><Button onClick={handleClickOpen}>+ Tambah Product</Button></Grid>
          :
          <Grid xs={4}><Button onClick={handleClickOpen}>+ Tambah Suplier</Button></Grid>
        }
        
        
      </Grid>

      { page === 'product' ?
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>No</StyledTableCell>
                <StyledTableCell align="left">Foto</StyledTableCell>
                <StyledTableCell align="left">Nama</StyledTableCell>
                <StyledTableCell align="left">Deskripsi</StyledTableCell>
                <StyledTableCell align="center">Harga</StyledTableCell>
                <StyledTableCell align="right">Stok</StyledTableCell>
                <StyledTableCell align="left">Suplier</StyledTableCell>
                <StyledTableCell align="left"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listData.map((items, i) => (
                <StyledTableRow key={i}>
                  <StyledTableCell component="th" scope="row">
                    {i+1}
                  </StyledTableCell>
                  <StyledTableCell align="left"><img src={`${UPLOAD_URL}${items.foto}`} className="img" width="100"/></StyledTableCell>
                  <StyledTableCell align="left">{items.nama}</StyledTableCell>
                  <StyledTableCell align="left">{items.deskripsi}</StyledTableCell>
                  <StyledTableCell align="right">{currencyFormat(items.harga, 'IDR')}</StyledTableCell>
                  <StyledTableCell align="right">{items.stok}</StyledTableCell>
                  <StyledTableCell align="left">{items.nama_suplier}</StyledTableCell>
                  <StyledTableCell align="left">
                    <BottomNavigationAction label="Edit" icon={<EditIcon />} onClick={handleEdit} data-id={items.id}/>
                    <BottomNavigationAction label="Delete" icon={<DeleteIcon />} onClick={handleDelete} data-id={items.id}/>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        :
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>No</StyledTableCell>
                <StyledTableCell align="left">Nama Suplier</StyledTableCell>
                <StyledTableCell align="left">Alamat</StyledTableCell>
                <StyledTableCell align="left">Email</StyledTableCell>
                <StyledTableCell align="left"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((items, i) => (
                <StyledTableRow key={i}>
                  <StyledTableCell component="th" scope="row">
                    {i+1}
                  </StyledTableCell>
                  <StyledTableCell align="left">{items.nama_suplier}</StyledTableCell>
                  <StyledTableCell align="left">{items.alamat}</StyledTableCell>
                  <StyledTableCell align="left">{items.email}</StyledTableCell>
                  <StyledTableCell align="left">
                    <BottomNavigationAction label="Edit" icon={<EditIcon />} onClick={handleEdit} data-id={items.id_suplier}/>
                    <BottomNavigationAction label="Delete" icon={<DeleteIcon />} onClick={handleDelete} data-id={items.id_suplier}/>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
      
      
      <Dialog
        fullWidth={true}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {details === null ? 'Tambah' : 'Ubah'} Produk
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} enctype="multipart/form-data">
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    xs={12} 
                    label="Nama Produk" 
                    variant="outlined" 
                    placeholder="Nama Produk"
                    onChange={handleChange}
                    name="nama"
                    type="text"
                    defaultValue={details === null ? formData.nama : details.nama}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    md="12" 
                    label="Deskripsi Produk" 
                    variant="outlined" 
                    placeholder="Deskripsi Produk"
                    onChange={handleChange}
                    name="deskripsi"
                    multiline
                    row={4}
                    defaultValue={details === null ? formData.deskripsi : details.deskripsi}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    md="12" 
                    label="Harga Produk" 
                    variant="outlined" 
                    placeholder="Harga Produk"
                    onChange={handleChange}
                    name="harga"
                    type="number"
                    defaultValue={details === null ? formData.harga : details.harga}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    md="12" 
                    label="Stok Produk" 
                    variant="outlined" 
                    placeholder="Stok Produk"
                    onChange={handleChange}
                    name="stok"
                    type="number"
                    defaultValue={details === null ? formData.stok : details.stok}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <Select 
                    name="suplier_id"
                    variant="outlined"
                    id="outlined-basic" 
                    defaultValue={details === null ? formData.suplier_id : details.suplier_id}
                    label="Suplier"
                    placeholder="Suplier"
                    onChange={handleChangeSelect}
                >
                  {suppliers.map((items, i) => (
                    <MenuItem 
                      key={i}
                      value={items.id_suplier}
                    >
                      {items.nama_suplier}
                    </MenuItem >
                  ))}
                </Select>
              
              </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  {/* <input type="hidden" name="foto" value="product2.jpg"/> */}
                  <img src={createObjectURL} width="100" />
                  <input type="file" name="upload" onChange={handleUploadImage} />
                </FormControl>
              </Grid>
            </Grid>
            
            <Button type="submit" variant="contained">Submit</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        fullWidth={true}
        open={openSuplier}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {details === null ? 'Tambah' : 'Ubah'} Suplier
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    xs={12} 
                    label="Nama Suplier" 
                    variant="outlined" 
                    placeholder="Nama Suplier"
                    onChange={handleChange}
                    name="nama_suplier"
                    type="text"
                    defaultValue={details === null ? formData.nama_suplier : details.nama_suplier}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    md="12" 
                    label="Alamat" 
                    variant="outlined" 
                    placeholder="Alamat"
                    onChange={handleChange}
                    name="alamat"
                    multiline
                    row={4}
                    defaultValue={details === null ? formData.alamat : details.alamat}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <FormControl fullWidth sx={{m:1}}>
                  <TextField 
                    id="outlined-basic" 
                    className="input-text" 
                    md="12" 
                    label="Email" 
                    variant="outlined" 
                    placeholder="Email"
                    onChange={handleChange}
                    name="email"
                    type="text"
                    defaultValue={details === null ? formData.email : details.email}
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Button type="submit" variant="contained">Submit</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
export default(ListProducts);