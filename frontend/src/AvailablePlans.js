import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import "./AvailablePlans.css";

const plansData = [
  { id: 1, name: "Canva Pro", provider: "User123", price: 59, rating: 4.5, slot: "2/5" },
  { id: 2, name: "ChatGPT Plus", provider: "ProviderAI", price: 99, rating: 4.9, slot: "1/3" },
  { id: 3, name: "Netflix Standard", provider: "MovieFan", price: 79, rating: 4.2, slot: "3/5" },
];

export default function AvailablePlansPage() {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlans = plansData.filter((plan) => {
    return (
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      plan.price >= priceRange[0] &&
      plan.price <= priceRange[1]
    );
  });

  return (
    <div className="available-plans-container">
      <h1 className="heading">Available Plans</h1>

      <div className="filter-grid">
        <div className="filter-sidebar">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
            />
          </div>

          <div>
            <Label>Price Range</Label>
            <Slider
              defaultValue={[0, 100]}
              min={0}
              max={200}
              step={1}
              onValueChange={setPriceRange}
            />
            <div className="price-label">
              ₹{priceRange[0]} – ₹{priceRange[1]}
            </div>
          </div>
        </div>

        <div className="plan-list">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="card-content">
                  <div>
                    <h2 className="plan-name">{plan.name}</h2>
                    <p className="provider">Provider: {plan.provider}</p>
                    <p className="slot">Slot: {plan.slot}</p>
                  </div>
                  <div className="plan-price-details">
                    <p className="plan-price">₹{plan.price}</p>
                    <p className="rating">
                      <Star className="star-icon" />
                      {plan.rating}
                    </p>
                    <button className="book-button">Book Now</button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="no-plans">No plans found in this range.</p>
          )}
        </div>
      </div>
    </div>
  );
}
