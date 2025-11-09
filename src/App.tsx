import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { PageNotFound } from "./components/pages/common/page-not-found";
import HomePage from "./components/pages/common/home";
import { Route, Routes } from "react-router-dom";

const client = generateClient<Schema>();

function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  // function createTodo() {
  //   client.models.Todo.create({ content: window.prompt("Todo content") });
  // }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/*" element={<PageNotFound />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route element={<ProtectedRoute />}> */}
      {/* </Route> */}
    </Routes>
  );
}

export default App;
