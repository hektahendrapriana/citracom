export default {
    get_config: function(){
      return {
        BASE_URL: "http://localhost:3000",
        UPLOAD_URL: "http://localhost:3000/uploads/products/",
        UPLOAD_PATH: "./public/uploads/products/",
        DbFileName: "./test.db",
      }
    },
}