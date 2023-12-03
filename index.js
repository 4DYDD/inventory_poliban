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

const info = {
  berhasil: "",
  gagal: "",
  cari: "",
  halaman: "",
  sesi: {
    nimMahasiswa: "",
    emailMahasiswa: "",
    kodeAdmin: "",
    passwordAdmin: "",
    sesiTerbuka: false,
    tanggal: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`,
  },
};

const kataMutiara = () =>
  "bread_is_roti_shadow_is_bayang_before_kita_mati_better_kita_sembahyang";

let selectedData = "";

function isiSesi(
  nimMahasiswa,
  emailMahasiswa,
  kodeAdmin,
  passwordAdmin,
  sesiTerbuka
) {
  info.sesi.nimMahasiswa = nimMahasiswa;
  info.sesi.emailMahasiswa = emailMahasiswa;
  info.sesi.kodeAdmin = kodeAdmin;
  info.sesi.passwordAdmin = passwordAdmin;
  info.sesi.sesiTerbuka = sesiTerbuka;
}

function hapusSesi() {
  info.sesi = {
    nimMahasiswa: "",
    emailMahasiswa: "",
    kodeAdmin: "",
    passwordAdmin: "",
    sesiTerbuka: false,
  };
}

const validasiUser = (req, res) => {
  if (!info.sesi.nimMahasiswa && !info.sesi.emailMahasiswa) {
    info.berhasil = [
      "login",
      "Silahkan Masuk sebagai Pengguna terlebih dahulu",
    ];
    res.redirect("/");
    return false;
  } else {
    return true;
  }
};

const validasiAdmin = (req, res) => {
  if (!info.sesi.kodeAdmin && !info.sesi.passwordAdmin) {
    info.berhasil = [
      "admin",
      "Anda harus menjadi Admin untuk membuka menu Admin",
    ];
    res.redirect("/");
    return false;
  } else {
    return true;
  }
};

//TODO --> MENGURUSI MASALAH LOGIN--LOGOUT
app.post("/login", (req, res) => {
  const { nim_mahasiswa, email_mahasiswa } = req.body;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM user WHERE nim_mahasiswa = '${nim_mahasiswa}' AND email_mahasiswa = '${email_mahasiswa}'`,
        (err, results) => {
          if (err) reject([false, err]);
          const result = JSON.parse(JSON.stringify(results));
          if (result.length > 0) {
            resolve([true, "Login Berhasil"]);
          } else {
            reject([false, "Login gagal"]);
          }
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      //* handle berhasil
      isiSesi(nim_mahasiswa, email_mahasiswa, "", "", true);
      console.log(typeof info.sesi.nimMahasiswa);
      console.log(info.sesi.nimMahasiswa);
      info.berhasil = infonya;
      res.redirect("/");
    })
    .catch((err) => {
      //! --> handle error
      info.berhasil = err;
      res.redirect("/");
    });
});
app.post("/admin", (req, res) => {
  const { kode_admin, password_admin } = req.body;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM user WHERE kode_admin = '${kode_admin}' AND password_admin = '${password_admin}'`,
        (err, results) => {
          if (err) reject([false, err]);
          const result = JSON.parse(JSON.stringify(results));
          if (result.length > 0) {
            resolve([true, "Login Admin Berhasil"]);
          } else {
            reject([false, "Login gagal"]);
          }
        }
      );
    });
  };

  getData()
    .then((infonya) => {
      //* handle berhasil
      isiSesi("", "", kode_admin, password_admin, true);
      info.berhasil = infonya;
      res.redirect("/");
    })
    .catch((err) => {
      //! --> handle error
      info.berhasil = err;
      res.redirect("/");
    });
});
app.get("/logout/:laksanakan", (req, res) => {
  if (req.params.laksanakan === kataMutiara()) {
    hapusSesi();
    res.redirect("/");
  }
});
//TODO --> MENGURUSI MASALAH LOGIN--LOGOUT

//TODO --> HALAMAN USER
app.get("/", (req, res) => {
  info.halaman = "PeminjamanUser";

  const getBarang = ({ id_barang, nim_mahasiswa, barang_dipinjam, status }) => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM barang WHERE id_barang = '${id_barang}'`,
        (err, results) => {
          const resultBarang = JSON.parse(JSON.stringify(results[0]));
          resultBarang.id_barang = id_barang;
          resultBarang.nimMahasiswa = nim_mahasiswa;
          resultBarang.barangDipinjam = barang_dipinjam;
          resultBarang.status = status;
          resolve(resultBarang);
        }
      );
    });
  };

  const getData = () => {
    return new Promise((resolve, reject) => {
      const { nimMahasiswa, emailMahasiswa } = info.sesi;
      con.query(
        `SELECT * FROM info_peminjaman WHERE nim_mahasiswa = '${nimMahasiswa}' AND status != 'diterima'`,
        (err, results) => {
          let result = JSON.parse(JSON.stringify(results));
          if (result.length < 1) {
            reject({ pesan: info.berhasil, status: "tidak meminjam" });
          } else {
            getBarang(result[0]).then((resultBarang) => {
              result = resultBarang;
              console.log(result);
              resolve(result);
            });
          }
        }
      );
    });
  };

  getData()
    .then((dataPeminjaman) => {
      res.render("dashboard-view", {
        dataPeminjaman,
        berhasil: info.berhasil,
        sesinya: info.sesi,
        sesiTerbuka: info.sesi.sesiTerbuka,
        layout: "layouts/dashboard",
        title: "Halaman Utama Inventory Poliban",
      });

      info.berhasil = "";
    })
    .catch((infonya) => {
      const { pesan, status } = infonya;
      res.render("dashboard-view", {
        dataPeminjaman: { dataPeminjaman: {}, status },
        berhasil: pesan,
        sesinya: info.sesi,
        sesiTerbuka: info.sesi.sesiTerbuka,
        layout: "layouts/dashboard",
        title: "Halaman Utama Inventory Poliban",
      });

      info.berhasil = "";
    });
});

app.get("/peminjaman/user", (req, res) => {
  if (!validasiUser(req, res)) return;
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
        sesi: info.sesi,
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
        sesi: info.sesi,
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
  if (!validasiUser(req, res)) return;

  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/peminjaman/user");
});

app.get("/detailBarangUser/:primary", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiUser(req, res)) return;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM barang WHERE id_barang = '${req.params.primary}'`,
        (err, results) => {
          if (err) reject(err);
          const result = JSON.parse(JSON.stringify(results[0]));
          console.log(result);
          resolve(result);
        }
      );
    });
  };

  getData()
    .then((dataBarang) => {
      selectedData = dataBarang;
      selectedData.isinya = true;
      res.redirect("/peminjaman/user");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/pilihBarangDipinjam/:primary", (req, res) => {
  if (!validasiUser(req, res)) return;

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
  if (!validasiUser(req, res)) return;

  const {
    nama_barang,
    kategori_barang,
    jumlah_barang_dipinjam,
    id_barang,
    nim_peminjam,
    tanggal_meminjam,
    tanggal_mengembalikan,
  } = req.body;
  const tanggalMeminjam = new Date(tanggal_meminjam).toLocaleDateString(
    "id-ID"
  );
  const tanggalMengembalikan = new Date(
    tanggal_mengembalikan
  ).toLocaleDateString("id-ID");

  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE nim_mahasiswa = '${nim_peminjam}' AND status != 'diterima'`,
        (err, results) => {
          if (err) reject(err);
          const resultnya = JSON.parse(JSON.stringify(results));
          if (resultnya.length >= 1) {
            reject(
              "Anda belum mengembalikan barang yang sebelumnya anda pinjam"
            );
          } else if (jumlah_barang_dipinjam < 1) {
            reject(
              "Jumlah barang yang ingin dipinjam 0, anda tidak meminjam apapun"
            );
          } else {
            con.query(
              `INSERT INTO info_peminjaman (tanggal_meminjam, tanggal_mengembalikan, id_barang, barang_dipinjam, nim_mahasiswa, status) VALUES ('${tanggalMeminjam}', '${tanggalMengembalikan}', '${id_barang}', ${jumlah_barang_dipinjam}, '${nim_peminjam}', 'meminjam')`,
              (err, results) => {
                if (err) {
                  reject(err);
                } else {
                  resolve("Pinjam barang berhasil");
                }
              }
            );
          }
        }
      );
    });
  };

  editData()
    .then((infonya) => {
      info.berhasil = [true, infonya];
      res.redirect("/");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      res.redirect("/peminjaman/user");
    });
});

app.post("/kembalikanBarang", (req, res) => {
  if (!validasiUser(req, res)) return;

  const { nim_mahasiswa, barang_dipinjam, id_barang } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE info_peminjaman SET status = 'mengembalikan' WHERE nim_mahasiswa = ${nim_mahasiswa}`
      );

      resolve(
        "<b>Barang berhasil dikembalikan</b><br> Admin akan segera mengkonfirmasi pengembalian barang"
      );
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
//TODO --> HALAMAN USER

//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN BARANG
//HALAMAN BARANG
app.get("/barang", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/barang");
});

app.get("/detailBarang/:primary", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM barang WHERE id_barang = '${req.params.primary}'`,
        (err, results) => {
          if (err) reject(err);
          const result = JSON.parse(JSON.stringify(results[0]));
          console.log(result);
          resolve(result);
        }
      );
    });
  };

  getData()
    .then((dataBarang) => {
      selectedData = dataBarang;
      selectedData.isinya = true;
      res.redirect("/barang");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//TAMBAH BARANG
app.post("/tambahBarang", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/mahasiswa");
});

//TAMBAH MAHASISWA
app.post("/tambahMahasiswa", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const {
    nama_mahasiswa,
    jenkel_mahasiswa,
    alamat_mahasiswa,
    email_mahasiswa,
    nh_mahasiswa,
    nim_mahasiswa,
  } = req.body;
  const tambahData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `INSERT INTO data_mahasiswa (nama_mahasiswa, jenkel_mahasiswa, alamat_mahasiswa, email_mahasiswa, nh_mahasiswa) VALUES ('${nama_mahasiswa}', '${jenkel_mahasiswa}', '${alamat_mahasiswa}', '${email_mahasiswa}', '${nh_mahasiswa}')`,
        (err, results) => {
          if (err) reject(err);
        }
      );
      con.query(
        `SELECT * FROM data_mahasiswa WHERE email_mahasiswa = '${email_mahasiswa}'`,
        (err, results) => {
          const result = JSON.parse(JSON.stringify(results[0]));
          con.query(
            `INSERT INTO user (email_mahasiswa, nim_mahasiswa) VALUES ('${result.email_mahasiswa}', ${result.nim_mahasiswa})`,
            (err, results) => {
              if (err) reject(err);
              resolve("Tambah Data Berhasil");
            }
          );
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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const {
    nama_mahasiswa,
    jenkel_mahasiswa,
    alamat_mahasiswa,
    email_mahasiswa,
    nh_mahasiswa,
    nim_mahasiswa,
  } = req.body;
  const editData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `UPDATE data_mahasiswa SET nama_mahasiswa = '${nama_mahasiswa}', jenkel_mahasiswa = '${jenkel_mahasiswa}', alamat_mahasiswa = '${alamat_mahasiswa}', email_mahasiswa = '${email_mahasiswa}', nh_mahasiswa = '${nh_mahasiswa}' WHERE nim_mahasiswa = '${nim_mahasiswa}'`,
        (err, results) => {
          if (err) reject(err);
        }
      );

      con.query(
        `SELECT * FROM data_mahasiswa WHERE email_mahasiswa = '${email_mahasiswa}'`,
        (err, results) => {
          const result = JSON.parse(JSON.stringify(results[0]));
          con.query(
            `UPDATE user SET email_mahasiswa = '${result.email_mahasiswa}', nim_mahasiswa = '${result.nim_mahasiswa}' WHERE email_mahasiswa = '${result.email_mahasiswa}'`,
            (err, results) => {
              if (err) reject(err);
              resolve("Edit Data Berhasil");
            }
          );
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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  info.halaman = "Peminjaman";

  const getData = () => {
    return new Promise((resolve, reject) => {
      if (info.cari) {
        con.query(
          `SELECT * FROM info_peminjaman WHERE id_peminjaman LIKE '%${info.cari}%' OR tanggal_meminjam LIKE '%${info.cari}%' OR tanggal_mengembalikan LIKE '%${info.cari}%' OR id_barang LIKE '%${info.cari}%' OR nim_mahasiswa LIKE '%${info.cari}%' OR status LIKE '%${info.cari}%'`,
          (err, results) => {
            if (err) reject(err);
            resolve(JSON.parse(JSON.stringify(results)));
          }
        );
      } else {
        con.query(
          "SELECT * FROM info_peminjaman INNER JOIN barang ON info_peminjaman.id_barang = barang.id_barang INNER JOIN data_mahasiswa ON info_peminjaman.nim_mahasiswa = data_mahasiswa.nim_mahasiswa ORDER BY FIELD(status, 'meminjam') DESC, status;",
          (err, results) => {
            if (err) reject(err);
            resolve(JSON.parse(JSON.stringify(results)));
          }
        );
      }
    });
  };

  getData()
    .then((dataPeminjaman) => {
      res.render("peminjaman", {
        selectedData,
        dataPeminjaman,
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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      info.berhasil = [false, err];
      console.log(err);
      res.redirect("/peminjaman");
    });
});

app.get("/diterima/:primary", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
        (err, results) => {
          if (err) reject(err);
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
          resolve("Peminjam telah mengembalikan barang, barang diterima");
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
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const { DataYangDicari } = req.body;
  info.cari = DataYangDicari;
  res.redirect("/peminjaman");
});

// //TAMBAH PEMINJAMAN
// app.post("/tambahPeminjaman", (req, res) => {
//   //* --> CEK ADMIN
//   if (!validasiAdmin(req, res)) return;

//   const { id_peminjaman, waktu_peminjaman, id_barang, nim_mahasiswa } =
//     req.body;
//   const tambahData = () => {
//     return new Promise((resolve, reject) => {
//       con.query(
//         `INSERT INTO info_peminjaman (waktu_peminjaman, id_barang, nim_mahasiswa) VALUES ('${waktu_peminjaman}', '${id_barang}', '${nim_mahasiswa}')`,
//         (err, results) => {
//           if (err) reject(err);
//           resolve("Tambah Data Berhasil");
//         }
//       );
//     });
//   };

//   tambahData()
//     .then((infonya) => {
//       info.berhasil = [true, infonya];
//       res.redirect("/peminjaman");
//     })
//     .catch((err) => {
//       info.berhasil = [false, err];
//       console.log(err);
//       res.redirect("/peminjaman");
//     });
// });

//MW PEMINJAMAN YANG DIPILIH
app.get("/detailPinjam/:primary", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

  const getData = () => {
    return new Promise((resolve, reject) => {
      con.query(
        `SELECT * FROM info_peminjaman INNER JOIN barang ON info_peminjaman.id_barang = barang.id_barang INNER JOIN data_mahasiswa ON info_peminjaman.nim_mahasiswa = data_mahasiswa.nim_mahasiswa WHERE id_peminjaman = '${req.params.primary}'`,
        (err, results) => {
          if (err) reject(err);
          const result = JSON.parse(JSON.stringify(results[0]));
          console.log(result);
          resolve(result);
        }
      );
    });
  };

  getData()
    .then((dataPeminjaman) => {
      selectedData = dataPeminjaman;
      selectedData.isinya = true;
      res.redirect("/peminjaman");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//EDIT PEMINJAMAN
app.post("/editPeminjaman", (req, res) => {
  //* --> CEK ADMIN
  if (!validasiAdmin(req, res)) return;

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

// //HAPUS BARANG
// app.get("/hapusPeminjaman/:primary", (req, res) => {
//   //* --> CEK ADMIN
//   if (!validasiAdmin(req, res)) return;

//   const getData = () => {
//     return new Promise((resolve, reject) => {
//       con.query(
//         `DELETE FROM info_peminjaman WHERE id_peminjaman = ${req.params.primary}`,
//         (err, results) => {
//           if (err) reject(err);
//           resolve("Hapus Data Berhasil");
//         }
//       );
//     });
//   };

//   getData()
//     .then((infonya) => {
//       info.berhasil = [true, infonya];
//       res.redirect("/peminjaman");
//     })
//     .catch((err) => {
//       info.berhasil = [false, err];
//       console.error(err);
//       res.redirect("/peminjaman");
//     });
// });
//TODO MIDDLEWARE UNTUK MENANGANI HALAMAN PEMINJAMAN

//TODO --> MENANGANI JIKA USER MEMASUKKAN SEMBARANG URL
app.use((req, res) => {
  res.send(
    `<html><head><link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../css/output.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" /><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" /><link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Creepster&family=Hind:wght@300&family=Manjari&family=Nunito&family=Quicksand:wght@700&family=Skranji&family=Titillium+Web&family=Yatra+One&display=swap"
        rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"></script></head>
        <body class="bg-[rgb(252,252,252)] tw-tracking-wide tw-text-[1.15vw]" style="font-family: Nunito">
        <div class="alert alert-danger tw-min-w-[25vw] d-flex flex-column justify-content-center align-items-center gap-3 position-fixed tw-top-[-10%] tw-left-[50%] tw-translate-x-[-50%] tw-translate-y-[-50%] tw-z-[1] tw-transition-all tw-duration-500 tw-ease-out" id="alertnya" role="alert">
        <div>Halaman (<b>${req.originalUrl}</b>) tidak Ditemukan!</div>
        <div class="btn btn-warning" onclick="goTo('/', {delay: 100})">Kembali</div>
        </div>
        <script src="../../script/script.js"></script>
        </body>
        </html>`
  );
});
//TODO --> MENANGANI JIKA USER MEMASUKKAN SEMBARANG URL

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
