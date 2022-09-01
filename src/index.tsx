import Axios from "axios";
import React, {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useReducer,
  useState
} from "react";
import { render } from "react-dom";

import "./styles.css";

const pageSize = 10;

type User = {
  name: {
    first: string;
    last: string;
  };
  email: string;
  registered: {
    date: string;
  };
};

type UserState = {
  users: User[];
};

type Action =
  | {
      type: "UPDATE_USERS";
      payload;
    }
  | {
      type: "DELETE_USER";
      payload: User;
    };

const initialState: UserState = {
  users: []
};

const Context = createContext<[UserState, Dispatch<Action>]>([
  initialState,
  () => {
    return;
  }
]);

function reducer(state: UserState, action: Action) {
  switch (action.type) {
    case "UPDATE_USERS":
      return { ...state, users: action.payload };
    case "DELETE_USER":
      const users = state.users.filter(
        (user) => user.email !== action.payload.email
      );
      return { ...state, users };
    default:
      throw new Error();
  }
}

const UserProvider = ({ children }) => {
  const value = useReducer(reducer, initialState);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

function App() {
  const [state, dispatch] = useContext(Context);
  const { users } = state;
  const [page, setPage] = useState(0);
  const start = page * pageSize;
  const end = start + pageSize;
  const [query, setQuery] = useState("");
  const totalPage = Math.round(users.length / pageSize);

  const searchResults = query
    ? users.filter(
        (user) =>
          user?.email.includes(query) || user?.name.first.includes(query)
      )
    : users;

  const results = searchResults.slice(start, end);

  const getData = async () => {
    const { data } = await Axios.get(
      "https://randomuser.me/api/?results=51&seed=abc&inc=id,name,email,picture,registered"
    );

    const sortedResults = data.results.sort(
      (a, b) => +new Date(b.registered.date) - +new Date(a.registered.date)
    );

    dispatch({
      type: "UPDATE_USERS",
      payload: sortedResults
    });
  };

  const handleNext = () => {
    setPage((page) => page + 1);
  };

  const handlePrev = () => {
    setPage((page) => page - 1);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(0);
  };

  const handleDelete = (user) => {
    dispatch({
      type: "DELETE_USER",
      payload: user
    });
  };

  useEffect(() => {
    if (users.length === 0) {
      getData();
    }
  });

  return (
    <div className="App">
      <h1>Users</h1>
      <div>
        <div>
          <input type="search" placeholder="search" onChange={handleSearch} />
        </div>
        {!!page && <button onClick={handlePrev}>Prev</button>}
        {page < totalPage && <button onClick={handleNext}>Next</button>}
        <br />
        <br />
      </div>
      <table>
        <thead>
          <tr>
            <td>Email</td>
            <td>Name</td>
            <td>Date</td>
          </tr>
        </thead>
        <tbody>
          {results.map((user) => (
            <tr key={user.email}>
              <td>{user.email}</td>
              <td>{user.name.first + " " + user.name.last}</td>
              <td>{user.registered.date}</td>
              <td>
                <button onClick={() => handleDelete(user)}>delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(
  <UserProvider>
    <App />
  </UserProvider>,
  rootElement
);
