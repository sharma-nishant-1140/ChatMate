const Userboard = ({ users = [] }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Users Online</h2>
      <ul className="space-y-1">
        {users.map((user, idx) => (
          <li key={idx} className="text-gray-300">👤 {user}</li>
        ))}
      </ul>
    </div>
  );
};

export default Userboard;
