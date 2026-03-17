"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GroceryListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLists() {
      try {
        const q = query(collection(db, 'grocery_lists'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setLists(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching grocery lists:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLists();
  }, []);

  if (loading) return <div>Loading grocery lists...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grocery Lists</h1>
        <p className="mt-1 text-sm text-slate-500">View all generated grocery lists.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => {
          let parsedList = [];
          try {
            parsedList = JSON.parse(list.categorized_items);
          } catch (e) {
            console.error("Failed to parse list", e);
          }

          return (
            <div key={list.id} className="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">User ID: {list.user_id}</h3>
                  <p className="text-sm text-slate-500">
                    {list.createdAt?.toDate ? list.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {parsedList.map((cat: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-2">{cat.category}</h4>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {cat.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
