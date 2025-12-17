import React from 'react';
import { FavoriteItem, Category } from '../types';
import Card from './Card';

interface ItemListProps {
  items: FavoriteItem[];
  onRemove: (id: string) => void;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  let colorClass = "bg-gray-200";
  switch(category) {
    case Category.BOOK: colorClass = "bg-orange-300"; break;
    case Category.MOVIE: colorClass = "bg-purple-300"; break;
    case Category.TV_SERIES: colorClass = "bg-blue-300"; break;
    case Category.MUSIC: colorClass = "bg-pink-300"; break;
  }
  return (
    <span className={`${colorClass} text-xs font-black text-black border-2 border-black rounded-full px-2 py-0.5 mr-2`}>
      {category}
    </span>
  );
};

const ItemList: React.FC<ItemListProps> = ({ items, onRemove }) => {
  if (items.length === 0) {
    return (
      <Card className="text-center py-8 border-dashed" color="bg-gray-50">
        <p className="font-bold text-gray-600">Your bag is empty!</p>
        <p className="text-sm text-gray-600">Add some stuff above.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center justify-between bg-white border-2 border-black p-3 rounded-lg shadow-hard-sm hover:translate-x-1 transition-transform"
        >
          <div>
            <div className="flex items-center mb-1">
              <CategoryBadge category={item.category} />
              <span className="font-bold text-lg leading-tight text-black">{item.title}</span>
            </div>
            {item.details && <p className="text-xs text-gray-700 font-bold ml-1">by {item.details}</p>}
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
            aria-label="Remove item"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ItemList;