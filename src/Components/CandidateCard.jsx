import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Buttom";

export function CandidateCard({ candidate, onVote, hasVoted }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        <img
          src={candidate.photoUrl}
          alt={candidate.name}
          className="w-full h-35 max-h-[500px] object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
          <span className="font-semibold text-blue-600">#{candidate.number}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{candidate.name}</h3>
        <p className="text-gray-600  mb-4">
          Candidato a {candidate.position.charAt(0).toUpperCase() + candidate.position.slice(1)}
        </p>
        <Button
          variant={hasVoted ? "secondary" : "primary"}
          onClick={onVote}
          disabled={hasVoted}
          className="w-full"
        >
          {hasVoted ? "Ya has votado" : "Votar"}
        </Button>
      </div>
    </motion.div>
  );
}
