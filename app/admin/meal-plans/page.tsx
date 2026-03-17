"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MealPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const q = query(collection(db, 'meal_plans'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) return <div>Loading meal plans...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Meal Plans</h1>
        <p className="mt-1 text-sm text-slate-500">View all generated meal plans.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          let parsedPlan = [];
          try {
            parsedPlan = JSON.parse(plan.weekly_plan);
          } catch (e) {
            console.error("Failed to parse plan", e);
          }

          return (
            <div key={plan.id} className="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">User ID: {plan.user_id}</h3>
                  <p className="text-sm text-slate-500">
                    {plan.createdAt?.toDate ? plan.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {parsedPlan.map((day: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-2">{day.day}</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li><span className="font-medium">Breakfast:</span> {day.breakfast}</li>
                      <li><span className="font-medium">Lunch:</span> {day.lunch}</li>
                      <li><span className="font-medium">Snack:</span> {day.snack}</li>
                      <li><span className="font-medium">Dinner:</span> {day.dinner}</li>
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
