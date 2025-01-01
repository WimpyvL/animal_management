import React, { useEffect, useState } from 'react';
import { getAllAnimals } from './db';

const Dashboard = ({ db, handleEdit, deleteAnimal }) => {
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnimals = async () => {
      if (db) {
        try {
          const animalsData = await getAllAnimals(db);
          console.log('Fetched animals:', animalsData);
          setAnimals(animalsData);
        } catch (error) {
          console.error('Error fetching animals:', error);
        }
      }
    };
    fetchAnimals();
  }, [db]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    await deleteAnimal(db, id);
    const updatedAnimals = animals.filter(animal => animal.id !== id);
    setAnimals(updatedAnimals);
  };

  const [activeTab, setActiveTab] = useState('All');

  const filteredAnimals = animals.filter(animal => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      (animal.name && animal.name.toLowerCase().includes(search)) ||
      (animal.type && animal.type.toLowerCase().includes(search))
    );
    const matchesTab = activeTab === 'All' || animal.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const animalTypes = ['All', 'Cattle', 'Sheep', 'Pigs', 'Goats'];

  return (
    <div className="dashboard">
      <h1>Animal Dashboard</h1>
      <div className="tabs">
        {animalTypes.map(type => (
          <button
            key={type}
            className={activeTab === type ? 'active' : ''}
            onClick={() => setActiveTab(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search animals by name or type..." 
          value={searchTerm} 
          onChange={handleSearch} 
        />
      </div>
      <ul>
        {filteredAnimals.map(animal => (
          <li key={animal.id}>
            <h3>{animal.name}</h3>
            <div className="animal-details">
              <p><strong>Type:</strong> {animal.type || 'N/A'}</p>
              <p><strong>Breed:</strong> {animal.breed || 'N/A'}</p>
              <p><strong>Age:</strong> {animal.age ? `${animal.age} years` : 'N/A'}</p>
              <p><strong>Weight:</strong> {animal.weight ? `${animal.weight} kg` : 'N/A'}</p>
              {animal.type === 'Cattle' && (
                <>
                  <p><strong>Milk Production:</strong> {animal.milkProduction || 'N/A'}</p>
                  <p><strong>Grazing Area:</strong> {animal.grazingArea || 'N/A'}</p>
                  <p><strong>Vaccination Status:</strong> {animal.vaccinationStatus ? 'Yes' : 'No'}</p>
                </>
              )}
              {animal.type === 'Sheep' && (
                <>
                  <p><strong>Wool Quality:</strong> {animal.woolQuality || 'N/A'}</p>
                  <p><strong>Shearing Schedule:</strong> {animal.shearingSchedule || 'N/A'}</p>
                </>
              )}
              {animal.type === 'Pigs' && (
                <>
                  <p><strong>Feed Type:</strong> {animal.feedType || 'N/A'}</p>
                  <p><strong>Pen Number:</strong> {animal.penNumber || 'N/A'}</p>
                  <p><strong>Vaccination Status:</strong> {animal.vaccinationStatus ? 'Yes' : 'No'}</p>
                </>
              )}
              {animal.type === 'Goats' && (
                <>
                  <p><strong>Milk Production:</strong> {animal.milkProduction || 'N/A'}</p>
                  <p><strong>Horn Type:</strong> {animal.hornType || 'N/A'}</p>
                </>
              )}
            </div>
            <div className="button-group">
              <button onClick={() => handleEdit(animal)}>Edit</button>
              <button onClick={() => handleDelete(animal.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
