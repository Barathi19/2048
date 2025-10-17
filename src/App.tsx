import Grid from "./Grid/Grid";

function App() {
  return (
    <div className="min-h-screen w-full bg-amber-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold text-amber-700 mb-6">2048</h1>
      <Grid />
    </div>
  );
}

export default App;
