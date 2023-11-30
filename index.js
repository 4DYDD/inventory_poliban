const express = require("express");
const app = express();
const mysql = require("mysql");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const port = 8003;

app.set("view engine", "ejs");
app.set("views", "./public/view");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(
  session({
    secret: "rahasia", // kunci rahasia untuk menandatangani cookie sesi
    resave: false, // apakah sesi harus disimpan ulang meskipun tidak ada perubahan
    saveUninitialized: true, // apakah sesi harus dibuat sebelum ada data
    cookie: { secure: true }, // berapa lama cookie sesi akan berlaku (dalam milidetik)
  })
);
app.use(function (req, res, next) {
  res.locals.user = session.user;
  res.locals.errorMessage = session.errorMessage;
  next();
});

const info = {
  berhasil: "",
  gagal: "",
  cari: "",
  halaman: "",
};
let selectedData = "";

session.user = {};
session.user.username = "";
session.user.password = "";

let usernamenya;
let passwordnya;

app.post("/login", function (req, res) {
  // Menyimpan data user di sesi
  if (req.body.username === usernamenya && req.body.password === passwordnya) {
    session.user.username = req.body.username;
    session.user.password = req.body.password;
    res.redirect("/");
  }
});

app.get("/logout", function (req, res) {
  // Mengakhiri sesi
  session.user.username = "";
  session.user.password = "";
  req.session.destroy();
  // Mengarahkan ke halaman utama
  res.redirect("/");
});

app.get("/error", function (req, res) {
  session.errorMessage = "";
  req.session.destroy();

  res.redirect("/");
});

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory--poliban",
});

con.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + con.threadId);
});

//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN UTAMA
app.get("/", (req, res) => {
  info.halaman = "PeminjamanUser";

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE nim_mahasiswa = 34532`,
        (err, results) => {
          if (err) reject(err);

          const idBarang = JSON.parse(JSON.stringify(results[0]));
          console.log(idBarang);
          const nimMahasiswa = JSON.parse(
            JSON.stringify(results[0].nim_mahasiswa)
          );
          const barangDipinjam = JSON.parse(
            JSON.stringify(results[0].barang_dipinjam)
          );
          // JARAK
          con.query(
            `SELECT * FROM barang WHERE id_barang = ${idBarang}`,
            (err, results) => {
              const result = JSON.parse(JSON.stringify(results[0]));
              result.barangDipinjam = barangDipinjam;
              result.nimMahasiswa = nimMahasiswa;
              if (err) reject(err);
              resolve(result);
            }
          );
          // JARAK
        }
      );
    });
  };

  getData()
    .then((dataPeminjaman) => {
      res.render("dashboard-view", {
        dataPeminjaman,
        berhasil: info.berhasil,
        layout: "layouts/dashboard",
        title: "Halaman Utama Inventory Poliban",
      });
      info.berhasil = "";
    })
    .catch((err) => {
      console.error(err);
      // res.status(500).send("gagal diserver internalnya!");
      res.render("dashboard-view", {
        layout: "layouts/dashboard",
        title: "Halaman Dashboard Poliban",
      });
      info.berhasil = "";
    });
});

app.get("/peminjaman/user", (req, res) => {
  info.halaman = "PeminjamanUser";

  const getData = () => {
    return new Promise((resolve, reject) => {
      if (info.cari) {
        con.query(
          `SELECT * FROM barang WHERE id_barang LIKE '%${info.cari}%' OR nama_barang LIKE '%${info.cari}%' OR kategori_barang LIKE '%${info.cari}%' OR jumlah_barang LIKE '%${info.cari}%'`,
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      } else {
        con.query("SELECT * FROM barang", (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      }
    });
  };

  getData()
    .then((dataBarang) => {
      res.render("peminjaman-user", {
        selectedData,
        dataBarang: JSON.parse(JSON.stringify(dataBarang)),
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts-user",
        title: "Peminjaman Barang Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    })
    .catch((err) => {
      console.error(err);
      // res.status(500).send("gagal diserver internalnya!");
      res.render("peminjaman-user", {
        selectedData,
        dataBarang: [],
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Peminjaman User Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    });
});

app.post("/cariPeminjamanUser", (req, res) => {
  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/peminjaman/user");
});

app.get("/pilihBarangDipinjam/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM barang WHERE id_barang = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  getData()
    .then((dataBarang) => {
      selectedData = JSON.parse(JSON.stringify(dataBarang[0]));
      console.log(selectedData);
      res.redirect("/peminjaman/user");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/pinjamBarang", (req, res) => {
  const {
    nama_barang,
    kategori_barang,
    jumlah_barang_dipinjam,
    id_barang,
    nim_peminjam,
    waktu_meminjam,
  } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE nim_mahasiswa = '${nim_peminjam}' AND status != 'diterima'`,
        (err, results) => {
          if (err) reject(err);
          const resultnya = JSON.parse(JSON.stringify(results));
          if (resultnya.length >= 1) {
            resolve({
              pesan:
                "Anda belum mengembalikan barang yang sebelumnya anda pinjam",
              tipe: false,
            });
          } else {
            resolve({
              pesan: "Pinjam Barang Berhasil",
              tipe: true,
            });
          }
        }
      );
    });
  };

  editData()
    .then((infonya) => {
      if (infonya.tipe) {
        con.query(
          `INSERT INTO info_peminjaman (waktu_peminjaman, id_barang, barang_dipinjam, nim_mahasiswa, status) VALUES ('${waktu_meminjam}', '${id_barang}', ${jumlah_barang_dipinjam}, '${nim_peminjam}', 'meminjam')`,
          (err, results) => {
            if (err) {
              info.berhasil = [false, err];
              res.redirect("/peminjaman/user");
            } else {
              if (jumlah_barang_dipinjam < 1) {
                con.query(
                  `DELETE FROM info_peminjaman WHERE nim_mahasiswa = ${nim_peminjam}`
                );

                info.berhasil = [
                  false,
                  "Jumlah barang yang ingin dipinjam 0, anda tidak meminjam apapun",
                ];
                res.redirect("/peminjaman/user");
              } else {
                info.berhasil = [true, infonya.pesan];
                res.redirect("/peminjaman/user");
              }
            }
          }
        );
      } else {
        info.berhasil = [false, infonya.pesan];
        console.error(infonya.pesan);
        res.redirect("/peminjaman/user");
      }
    })
    .catch((err) => {
      info.berhasil = [false, err];
      res.redirect("/peminjaman/user");
    });
});

app.post("/kembalikanBarang", (req, res) => {
  const { nim_mahasiswa } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE info_peminjaman SET status = 'mengembalikan' WHERE nim_mahasiswa = ${nim_mahasiswa}`
      );
      con.query(
        `UPDATE barang jumlah_barang = jumlah_barang + ${jumlah_barang_dipinjam}, dipinjam = dipinjam - ${jumlah_barang_dipinjam} WHERE id_barang = ${id_barang}`,
        (err) => {
          if (err) reject(err);
        }
      );
      resolve("Barang berhasil dikembalikan");
    });
  };

  editData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/");
    });
});
//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN UTAMA

//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN BARANG
//HALAMAN BARANG
app.get("/barang", (req, res) => {
  info.halaman = "Barang";

  const getData = () => {
    return new Promise((resolve, reject) => {
      if (info.cari) {
        con.query(
          `SELECT * FROM barang WHERE id_barang LIKE '%${info.cari}%' OR nama_barang LIKE '%${info.cari}%' OR kategori_barang LIKE '%${info.cari}%' OR jumlah_barang LIKE '%${info.cari}%'`,
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      } else {
        con.query("SELECT * FROM barang", (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      }
    });
  };

  getData()
    .then((dataBarang) => {
      res.render("barang", {
        selectedData,
        dataBarang: JSON.parse(JSON.stringify(dataBarang)),
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Barang Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    })
    .catch((err) => {
      console.error(err);
      // res.status(500).send("gagal diserver internalnya!");
      res.render("barang", {
        selectedData,
        dataBarang: [],
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Barang Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    });
});

//MW BARANG YANG DICARI
app.post("/cariBarang", (req, res) => {
  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/barang");
});

//TAMBAH BARANG
app.post("/tambahBarang", (req, res) => {
  const {
    nama_barang,
    kategori_barang,
    jumlah_barang,
    gambar_barang,
    id_barang,
  } = req.body;
  const tambahData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `INSERT INTO barang (nama_barang, kategori_barang, jumlah_barang, gambar_barang) VALUES ('${nama_barang}', '${kategori_barang}', '${jumlah_barang}', '${gambar_barang}')`,
        (err, results) => {
          if (err) reject(err);
          resolve("Tambah Data Berhasil");
        }
      );
    });
  };

  tambahData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/barang");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/barang");
    });
});

//MW BARANG YANG DIPILIH
app.get("/pilihBarang/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM barang WHERE id_barang = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  getData()
    .then((dataBarang) => {
      selectedData = JSON.parse(JSON.stringify(dataBarang[0]));
      console.log(selectedData);
      res.redirect("/barang");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//EDIT BARANG
app.post("/editBarang", (req, res) => {
  const {
    nama_barang,
    kategori_barang,
    jumlah_barang,
    gambar_barang,
    id_barang,
  } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE barang SET nama_barang = '${nama_barang}', kategori_barang = '${kategori_barang}', jumlah_barang = ${jumlah_barang}, gambar_barang = '${gambar_barang}' WHERE id_barang = ${id_barang}`,
        (err, results) => {
          if (err) reject(err);
          resolve("Edit Data Berhasil");
        }
      );
    });
  };

  editData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/barang");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/barang");
    });
});

//HAPUS BARANG
app.get("/hapusBarang/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT dipinjam FROM barang WHERE id_barang = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          console.log(JSON.parse(JSON.stringify(results[0])));

          if (JSON.parse(JSON.stringify(results[0].dipinjam)) < 1) {
            con.query(
              `DELETE FROM barang WHERE id_barang = ${req.params.primary}`,
              (err, results) => {
                if (err) reject(err);
                resolve("Hapus Data Berhasil");
              }
            );
          } else {
            reject("Kamu tidak bisa menghapus barang yang masih dipinjam");
          }
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/barang");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/barang");
    });
});
//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN BARANG

//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN MAHASISWA
//HALAMAN MAHASISWA
app.get("/mahasiswa", (req, res) => {
  info.halaman = "Mahasiswa";

  const getData = () => {
    return new Promise((resolve, reject) => {
      if (info.cari) {
        con.query(
          `SELECT * FROM data_mahasiswa WHERE nim_mahasiswa LIKE '%${info.cari}%' OR nama_mahasiswa LIKE '%${info.cari}%' OR alamat_mahasiswa LIKE '%${info.cari}%' OR email_mahasiswa LIKE '%${info.cari}%' OR nh_mahasiswa LIKE '%${info.cari}%'`,
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      } else {
        con.query("SELECT * FROM data_mahasiswa", (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      }
    });
  };

  getData()
    .then((dataMahasiswa) => {
      res.render("mahasiswa", {
        selectedData,
        dataMahasiswa: JSON.parse(JSON.stringify(dataMahasiswa)),
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Mahasiswa Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    })
    .catch((err) => {
      console.error(err);
      // res.status(500).send("gagal diserver internalnya!");
      res.render("mahasiswa", {
        selectedData,
        dataMahasiswa: [],
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Mahasiswa Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    });
});

//MW MAHASISWA YANG DICARI
app.post("/cariMahasiswa", (req, res) => {
  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/mahasiswa");
});

//TAMBAH MAHASISWA
app.post("/tambahMahasiswa", (req, res) => {
  const {
    nama_mahasiswa,
    alamat_mahasiswa,
    email_mahasiswa,
    nh_mahasiswa,
    nim_mahasiswa,
  } = req.body;
  const tambahData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `INSERT INTO data_mahasiswa (nama_mahasiswa, alamat_mahasiswa, email_mahasiswa, nh_mahasiswa) VALUES ('${nama_mahasiswa}', '${alamat_mahasiswa}', '${email_mahasiswa}', '${nh_mahasiswa}')`,
        (err, results) => {
          if (err) reject(err);
          resolve("Tambah Data Berhasil");
        }
      );
    });
  };

  tambahData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/mahasiswa");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/mahasiswa");
    });
});

//MW MAHASISWA YANG DIPILIH
app.get("/pilihMahasiswa/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM data_mahasiswa WHERE nim_mahasiswa = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  getData()
    .then((dataMahasiswa) => {
      selectedData = JSON.parse(JSON.stringify(dataMahasiswa[0]));
      res.redirect("/mahasiswa");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//EDIT MAHASISWA
app.post("/editMahasiswa", (req, res) => {
  const {
    nama_mahasiswa,
    alamat_mahasiswa,
    email_mahasiswa,
    nh_mahasiswa,
    nim_mahasiswa,
  } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE data_mahasiswa SET nama_mahasiswa = '${nama_mahasiswa}', alamat_mahasiswa = '${alamat_mahasiswa}', email_mahasiswa = '${email_mahasiswa}', nh_mahasiswa = ${nh_mahasiswa} WHERE nim_mahasiswa = ${nim_mahasiswa}`,
        (err, results) => {
          if (err) reject(err);
          resolve("Edit Data Berhasil");
        }
      );
    });
  };

  editData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/mahasiswa");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/mahasiswa");
    });
});

//HAPUS MAHASISWA
app.get("/hapusMahasiswa/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `DELETE FROM data_mahasiswa WHERE nim_mahasiswa = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve(["Hapus data berhasil", results]);
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      console.log(infonya[1]);
      if (infonya[1].affectedRows < 1) {
        info.berhasil = [false, "Tidak ada data yang bisa dihapus"];
      } else {
        info.berhasil = [true, infonya[0]];
      }
      res.redirect("/mahasiswa");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/mahasiswa");
    });
});
//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN MAHASISWA

//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN PEMINJAMAN
//HALAMAN PEMINJAMAN
app.get("/peminjaman", (req, res) => {
  info.halaman = "Peminjaman";

  const getData = () => {
    return new Promise((resolve, reject) => {
      if (info.cari) {
        con.query(
          `SELECT * FROM info_peminjaman WHERE id_peminjaman LIKE '%${info.cari}%' OR waktu_peminjaman LIKE '%${info.cari}%' OR id_barang LIKE '%${info.cari}%' OR nim_mahasiswa LIKE '%${info.cari}%' OR status LIKE '%${info.cari}%'`,
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      } else {
        con.query(
          "SELECT * FROM info_peminjaman INNER JOIN barang ON info_peminjaman.id_barang = barang.id_barang INNER JOIN data_mahasiswa ON info_peminjaman.nim_mahasiswa = data_mahasiswa.nim_mahasiswa ORDER BY FIELD(status, 'meminjam') DESC, status;",
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      }
    });
  };

  getData()
    .then((dataPeminjaman) => {
      res.render("peminjaman", {
        selectedData,
        dataPeminjaman: JSON.parse(JSON.stringify(dataPeminjaman)),
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Barang Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    })
    .catch((err) => {
      console.error(err);
      res.render("peminjaman", {
        selectedData,
        dataPeminjaman: [],
        berhasil: info.berhasil,
        cari: info.cari,
        halaman: info.halaman,
        layout: "layouts/main-layouts",
        title: "Halaman Barang Poliban",
      });
      info.cari = "";
      info.berhasil = "";
      selectedData = "";
    });
});

app.get("/dipinjamkan/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          const result = JSON.parse(JSON.stringify(results[0]));
          con.query(
            `UPDATE barang SET jumlah_barang = jumlah_barang - ${result.barang_dipinjam}, dipinjam = dipinjam + ${result.barang_dipinjam} WHERE id_barang = ${result.id_barang}`,
            (err, results) => {
              if (err) {
                con.query(
                  `DELETE FROM info_peminjaman WHERE nim_mahasiswa = ${result.nim_mahasiswa}`
                );
                reject(
                  err +
                    "<br><br>Kamu meminjam terlalu banyak, barangnya tidak cukup"
                );
              }
              resolve("Pinjam Barang Berhasil");
            }
          );
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      con.query(
        `UPDATE info_peminjaman SET status = 'dipinjamkan' WHERE id_peminjaman = ${req.params.primary}`
      );
      info.berhasil = [true, infonya];
      res.redirect("/peminjaman/user");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.log(err);
      res.redirect("/peminjaman");
    });
});
app.get("/diterima/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          const result = JSON.parse(JSON.stringify(results[0]));
          con.query(
            `UPDATE barang SET jumlah_barang = jumlah_barang + ${result.barang_dipinjam}, dipinjam = dipinjam - ${result.barang_dipinjam} WHERE id_barang = ${result.id_barang}`
          );
        }
      );
      con.query(
        `DELETE FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve("Barang telah dikembalikan dan diterima");
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.log(err);
      res.redirect("/peminjaman");
    });
});

//MW PEMINJAMAN YANG DICARI
app.post("/cariPeminjaman", (req, res) => {
  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/peminjaman");
});

//TAMBAH PEMINJAMAN
app.post("/tambahPeminjaman", (req, res) => {
  const { id_peminjaman, waktu_peminjaman, id_barang, nim_mahasiswa } =
    req.body;
  const tambahData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `INSERT INTO info_peminjaman (waktu_peminjaman, id_barang, nim_mahasiswa) VALUES ('${waktu_peminjaman}', '${id_barang}', '${nim_mahasiswa}')`,
        (err, results) => {
          if (err) reject(err);
          resolve("Tambah Data Berhasil");
        }
      );
    });
  };

  tambahData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.log(err);
      res.redirect("/peminjaman");
    });
});

//MW PEMINJAMAN YANG DIPILIH
app.get("/pilihPeminjaman/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });
  };

  getData()
    .then((dataPeminjaman) => {
      selectedData = JSON.parse(JSON.stringify(dataPeminjaman[0]));
      console.log(selectedData);
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//EDIT PEMINJAMAN
app.post("/editPeminjaman", (req, res) => {
  const { waktu_peminjaman, id_barang, nim_mahasiswa, status, id_peminjaman } =
    req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE info_peminjaman SET waktu_peminjaman = '${waktu_peminjaman}', id_barang = '${id_barang}', nim_mahasiswa = '${nim_mahasiswa}', status = '${status}' WHERE id_peminjaman = ${id_peminjaman}`,
        (err, results) => {
          if (err) reject(err);
          resolve("Edit Data Berhasil");
        }
      );
    });
  };

  editData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      info.berhasil = [false, err.message];
      res.redirect("/peminjaman");
    });
});

//HAPUS BARANG
app.get("/hapusPeminjaman/:primary", (req, res) => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `DELETE FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
          resolve("Hapus Data Berhasil");
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.error(err);
      res.redirect("/peminjaman");
    });
});
//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN PEMINJAMAN

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
