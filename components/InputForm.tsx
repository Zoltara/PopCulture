import React, { useState } from 'react';
import { Category, FavoriteItem } from '../types';
import Button from './Button';
import Card from './Card';

interface InputFormProps {
  onAdd: (item: FavoriteItem) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onAdd }) => {
  const [category, setCategory] = useState<Category>(Category.MOVIE);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      id: crypto.randomUUID(),
      category,
      title: title.trim(),
      details: details.trim(),
    });

    setTitle('');
    setDetails('');
  };

  const getPlaceholder = (cat: Category) => {
    switch(cat) {
      case Category.BOOK: return "Author (Optional)";
      case Category.MUSIC: return "Artist (Optional)";
      default: return "Genre/Director (Optional)";
    }
  };

  return (
    <Card title="Add Your Faves" color="bg-cartoon-blue" className="mb-6 text-black">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block font-bold mb-1 text-sm text-black">Type</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full border-2 border-black rounded-lg p-2 text-white bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block font-bold mb-1 text-sm text-black">Title / Name</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Inception, Nirvana"
            className="w-full border-2 border-black rounded-lg p-2 text-white bg-black placeholder-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
           <label className="block font-bold mb-1 text-sm text-black">Details</label>
          <input 
            type="text" 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={getPlaceholder(category)}
            className="w-full border-2 border-black rounded-lg p-2 text-white bg-black placeholder-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <Button type="submit" variant="primary" className="mt-2 w-full justify-center">
          Add to List +
        </Button>
      </form>
    </Card>
  );
};

export default InputForm;