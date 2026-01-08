export default function Card({ title, content }) {
    return (
      <div className="bg-white border rounded-lg shadow-md p-4 max-w-sm">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-gray-700">{content}</p>
      </div>
    );
  }
  