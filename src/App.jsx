import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";
import { initDB, addAnimal, getAnimal, getAllAnimals, updateAnimal, deleteAnimal } from "./db";
import Dashboard from "./Dashboard";
import UserAuth from "./UserAuth";

const App = () => {
  const [db, setDb] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const animalFieldConfigs = {
    Cattle: {
      name: "",
      breed: "",
      age: "",
      weight: "",
      milkProduction: "",
      grazingArea: "",
      vaccinationStatus: false
    },
    Sheep: {
      name: "",
      breed: "",
      age: "",
      weight: "",
      woolQuality: "",
      grazingArea: "",
      shearingSchedule: ""
    },
    Pigs: {
      name: "",
      breed: "",
      age: "",
      weight: "",
      feedType: "",
      penNumber: "",
      vaccinationStatus: false
    },
    Goats: {
      name: "",
      breed: "",
      age: "",
      weight: "",
      milkProduction: "",
      grazingArea: "",
      hornType: ""
    }
  };

  const [formData, setFormData] = useState(animalFieldConfigs.Cattle);
  const [currentAnimalType, setCurrentAnimalType] = useState("Cattle");
  const [qrValue, setQrValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const animalCategories = [
    {
      type: "Cattle",
      icon: "🐄",
      description: "Manage your cattle records"
    },
    {
      type: "Sheep",
      icon: "🐑",
      description: "Track your sheep inventory"
    },
    {
      type: "Pigs",
      icon: "🐷",
      description: "Monitor your pig population"
    },
    {
      type: "Goats",
      icon: "🐐",
      description: "Organize your goat records"
    }
  ];

  useEffect(() => {
    const initializeDb = async () => {
      const database = await initDB();
      setDb(database);
    };
    initializeDb();
  }, []);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(success, error);

      function success(result) {
        handleScan(result);
        scanner.clear();
        setScanning(false);
      }

      function error(err) {
        console.error(err);
      }

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (editMode) {
        await updateAnimal(db, editId, formData, currentAnimalType);
      } else {
        const id = await addAnimal(db, formData, currentAnimalType);
        const qrData = JSON.stringify({ 
          id, 
          type: currentAnimalType,
          name: formData.name,
          breed: formData.breed,
          age: formData.age,
          weight: formData.weight
        });
        setQrValue(qrData);
        await updateAnimal(db, id, { qrCode: qrData }, currentAnimalType);
      }
      setFormData(animalFieldConfigs[currentAnimalType]);
      setEditMode(false);
      setEditId(null);
    } catch (error) {
      console.error("Error saving animal:", error);
    }
  };

  const handleEdit = (animal) => {
    setFormData(animal);
    setEditMode(true);
    setEditId(animal.id);
    navigate("/add");
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const qrData = JSON.parse(data);
        if (!qrData.id) {
          throw new Error("Invalid QR code format");
        }
        
        const animal = await getAnimal(db, qrData.id);
        if (animal) {
          setFormData(animal);
          setCurrentAnimalType(qrData.type || 'Cattle');
          navigate("/details");
        } else {
          throw new Error("Animal not found");
        }
      } catch (error) {
        console.error("Error scanning QR code:", error);
        alert("Error scanning QR code: " + error.message);
      }
    }
  };

  const handleCategoryClick = (type) => {
    setCurrentAnimalType(type);
    setFormData(animalFieldConfigs[type]);
    navigate("/add");
  };

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          {!user ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </>
          ) : (
            <li><button onClick={() => { setUser(null); navigate("/login"); }}>Logout</button></li>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/login" element={<UserAuth db={db} setUser={setUser} navigate={navigate} action="login" />} />
        <Route path="/signup" element={<UserAuth db={db} setUser={setUser} navigate={navigate} action="signup" />} />
        <Route path="/dashboard" element={
          user ? <Dashboard db={db} handleEdit={handleEdit} deleteAnimal={deleteAnimal} /> : 
          <div>Please log in to view the dashboard</div>
        } />
        <Route path="/add" element={
          <div className="container">
            {qrValue ? (
              <>
                <h1>Animal QR Code</h1>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <QRCode 
                    value={qrValue}
                    size={256}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
                    <button 
                      onClick={() => window.print()}
                      style={{ padding: "8px 16px" }}
                    >
                      Print QR Code
                    </button>
                    <button 
                      onClick={() => {
                        setTimeout(() => {
                          const canvas = document.querySelector('canvas');
                          if (canvas) {
                            const link = document.createElement('a');
                            link.href = canvas.toDataURL();
                            link.download = `animal_${formData.name || 'qr'}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            alert('QR code not available for download');
                          }
                        }, 100);
                      }}
                      style={{ padding: "8px 16px" }}
                    >
                      Download QR Code
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1>{editMode ? "Edit Animal" : "Add New Animal"}</h1>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {Object.entries(formData).map(([field, value]) => (
                    <div className="form-group" key={field}>
                      <label>{field.split(/(?=[A-Z])/).join(" ")}:</label>
                      {typeof value === 'boolean' ? (
                        <input
                          type="checkbox"
                          name={field}
                          checked={value}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: field,
                              value: e.target.checked
                            }
                          })}
                        />
                      ) : (
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          name={field}
                          value={value}
                          onChange={handleInputChange}
                          required
                        />
                      )}
                    </div>
                  ))}
                  <button type="submit">{editMode ? "Update Animal" : "Add Animal"}</button>
                </form>
              </>
            )}

          </div>
        } />
        <Route path="/details" element={
          <div className="container">
            <h1>Animal Details</h1>
            <div className="animal-card">
              <div className="card-header">
                <h2>{formData.name}</h2>
                <span className="animal-type">{formData.type}</span>
              </div>
              <div className="card-body">
                <div className="card-section">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Breed:</span>
                      <span className="value">{formData.breed || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Age:</span>
                      <span className="value">{formData.age ? `${formData.age} years` : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Weight:</span>
                      <span className="value">{formData.weight ? `${formData.weight} kg` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {formData.type === 'Cattle' && (
                  <div className="card-section">
                    <h3>Cattle Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Milk Production:</span>
                        <span className="value">{formData.milkProduction || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Grazing Area:</span>
                        <span className="value">{formData.grazingArea || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Vaccination Status:</span>
                        <span className="value">{formData.vaccinationStatus ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'Sheep' && (
                  <div className="card-section">
                    <h3>Sheep Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Wool Quality:</span>
                        <span className="value">{formData.woolQuality || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Shearing Schedule:</span>
                        <span className="value">{formData.shearingSchedule || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'Pigs' && (
                  <div className="card-section">
                    <h3>Pig Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Feed Type:</span>
                        <span className="value">{formData.feedType || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Pen Number:</span>
                        <span className="value">{formData.penNumber || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Vaccination Status:</span>
                        <span className="value">{formData.vaccinationStatus ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === 'Goats' && (
                  <div className="card-section">
                    <h3>Goat Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Milk Production:</span>
                        <span className="value">{formData.milkProduction || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Horn Type:</span>
                        <span className="value">{formData.hornType || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button onClick={() => navigate(-1)} className="back-button">
                  Back
                </button>
              </div>
            </div>
          </div>
        } />
        <Route path="/" element={
          <div className="home-container">
            <div className="scanner-section">
              <h2>Scan QR Code</h2>
              <button onClick={() => setScanning(!scanning)} className="scan-button">
                {scanning ? "Stop Scanning" : "Start Scanning"}
              </button>
              {scanning && (
                <div id="reader" className="scanner"></div>
              )}
            </div>
            
            <div className="categories-section">
              <h2>Select Animal Category</h2>
              <div className="category-grid">
                {animalCategories.map((category) => (
                  <div 
                    key={category.type} 
                    className="category-card"
                    onClick={() => handleCategoryClick(category.type)}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.type}</h3>
                    <p>{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;
