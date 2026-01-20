export const Position = {
    PERSONERIA: 'personeria',
    CONTRALORIA: 'contraloria'
  };
  
  export const createCandidate = (id, name, number, position, photoUrl, votes) => ({
    id,
    name,
    number,
    position,
    photoUrl,
    votes
  });
  
  export const createUser = (username, password, isAdmin, hasVoted) => ({
    username,
    password,
    isAdmin,
    hasVoted
  });
  