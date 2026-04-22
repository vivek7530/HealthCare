const UserModel = require("../models/UserModel");
const DoctorModel = require("../models/DoctorModel");
const PatientModel = require("../models/PatientModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        if (decoded.role === "admin" || decoded.role === "doctor") {
          next();
        } else {
          return res.json("Not authorized - Admin or Doctor access required");
        }
      }
    });
  }
};

const verifyPatient = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        if (decoded.role === "patient" || decoded.role === "user") {
          next();
        } else {
          return res.json("Not authorized - Patient access required");
        }
      }
    });
  }
};

const verifyAnyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        next();
      }
    });
  }
};

const UserController = {
  dashboard: (req, res) => {
    res.json("Success");
  },

  register: (req, res) => {
    const {
      name,
      email,
      phone,
      age,
      sex,
      blood,
      imageUrl,
      password,
      role,
      specialization,
      experience,
    } = req.body;
    
    bcrypt
      .hash(password, 10)
      .then((hash) => {
        const userData = {
          name,
          email,
          phone,
          imageUrl,
          password: hash,
        };
        
        // Add optional fields only if they exist
        if (age) userData.age = age;
        if (sex) userData.sex = sex;
        if (blood) userData.blood = blood;
        
        // Save to Doctor table if role is doctor
        if (role === 'doctor') {
          DoctorModel.create({
            ...userData,
            role: 'doctor',
            specialization,
            experience,
          })
          .then((doctor) => res.json("Success"))
          .catch((err) => res.json(err));
        }
        // Save to Patient table if role is patient
        else {
          PatientModel.create({
            ...userData,
            role: 'patient',
          })
          .then((patient) => res.json("Success"))
          .catch((err) => res.json(err));
        }
      })
      .catch((err) => res.json(err));
  },

  login: (req, res) => {
    const { email, password, role } = req.body;
    
    // Check in Doctor table if role is doctor
    if (role === 'doctor') {
      DoctorModel.findOne({ email: email }).then((doctor) => {
        if (doctor) {
          bcrypt.compare(password, doctor.password, (err, response) => {
            if (response) {
              const token = jwt.sign(
                { email: doctor.email, role: 'doctor' },
                JWT_SECRET,
                { expiresIn: "1d" }
              );
              res.cookie("token", token);
              return res.json({ Status: "Success", role: "doctor", user: doctor });
            } else {
              return res.json("The password is incorrect");
            }
          });
        } else {
          return res.json("no record Found");
        }
      });
    }
    // Check in Patient table if role is patient
    else if (role === 'patient') {
      PatientModel.findOne({ email: email }).then((patient) => {
        if (patient) {
          bcrypt.compare(password, patient.password, (err, response) => {
            if (response) {
              const token = jwt.sign(
                { email: patient.email, role: 'patient' },
                JWT_SECRET,
                { expiresIn: "1d" }
              );
              res.cookie("token", token);
              return res.json({ Status: "Success", role: "patient", user: patient });
            } else {
              return res.json("The password is incorrect");
            }
          });
        } else {
          return res.json("no record Found");
        }
      });
    }
    // Check both tables if no role specified
    else {
      // First check Doctor table
      DoctorModel.findOne({ email: email }).then((doctor) => {
        if (doctor) {
          bcrypt.compare(password, doctor.password, (err, response) => {
            if (response) {
              const token = jwt.sign(
                { email: doctor.email, role: 'doctor' },
                JWT_SECRET,
                { expiresIn: "1d" }
              );
              res.cookie("token", token);
              return res.json({ Status: "Success", role: "doctor", user: doctor });
            } else {
              return res.json("The password is incorrect");
            }
          });
        } else {
          // If not found in Doctor, check Patient
          PatientModel.findOne({ email: email }).then((patient) => {
            if (patient) {
              bcrypt.compare(password, patient.password, (err, response) => {
                if (response) {
                  const token = jwt.sign(
                    { email: patient.email, role: 'patient' },
                    JWT_SECRET,
                    { expiresIn: "1d" }
                  );
                  res.cookie("token", token);
                  return res.json({ Status: "Success", role: "patient", user: patient });
                } else {
                  return res.json("The password is incorrect");
                }
              });
            } else {
              return res.json("no record Found");
            }
          });
        }
      });
    }
  },
  getAllUsers: (req, res) => {
    // Retrieve all users from the database
    UserModel.find({})
      .then((users) => res.json(users))
      .catch((err) =>
        res.status(500).json({ message: "Internal server error" })
      );
  },

  me: (req, res) => {
    const token = req.cookies.token;

    // Check if token is provided
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is missing" });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      // Token is valid, retrieve user information from appropriate table
      if (decoded.role === 'doctor') {
        DoctorModel.findOne({ email: decoded.email })
          .then((doctor) => {
            if (doctor) {
              return res.json({ user: doctor });
            } else {
              return res.status(404).json({ message: "Doctor not found" });
            }
          })
          .catch((err) =>
            res.status(500).json({ message: "Internal server error" })
          );
      } else if (decoded.role === 'patient') {
        PatientModel.findOne({ email: decoded.email })
          .then((patient) => {
            if (patient) {
              return res.json({ user: patient });
            } else {
              return res.status(404).json({ message: "Patient not found" });
            }
          })
          .catch((err) =>
            res.status(500).json({ message: "Internal server error" })
          );
      } else {
        return res.status(400).json({ message: "Invalid user role" });
      }
    });
  },
  logout: (req, res) => {
    // Clear the token cookie by setting it to an empty value and expiring it
    res.cookie("token", "", { expires: new Date(0) });
    res.json("Logout successful");
  },
  deleteUser: (req, res) => {
    const id = req.params.id;
    UserModel.findByIdAndDelete({ _id: id })
      .then((result) => res.json(result))
      .catch((err) => res.json(err));
  },
};
module.exports = { UserController, verifyUser, verifyPatient, verifyAnyUser };
