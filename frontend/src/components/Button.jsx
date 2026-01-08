export default function Button({ text, onClick }) {
    return (
      <button
        onClick={onClick}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition"
      >
        {text}
      </button>
    );
  }
  