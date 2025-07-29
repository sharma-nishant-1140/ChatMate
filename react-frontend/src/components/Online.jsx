const Online = ({ count = 0 }) => {
  return (
    <span className="w-1/3 text-green-400 tracking-wide">
      Online: {count}
    </span>
  );
};

export default Online;