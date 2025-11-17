import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthenticationProvider from "./components/Authentication-Provider.jsx";
import {Provider} from "react-redux";
import createStore from "./store/store.js";

const store = createStore();
console.log("store", store.getState());

store.subscribe(() => {
  console.log("Updated Store:", store.getState());
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store = {store}>
      <AuthenticationProvider>
      <App />
    </AuthenticationProvider>
    </Provider>
  </BrowserRouter>
);
