import './App.css'

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from "./components/Home.tsx";
import Activities from "./components/activities/Activities.tsx";
import ActivityProviders from "./components/activity-providers/ActivityProviders.tsx";
import IAPs from "./components/iaps/IAPs.tsx";
import ConfigInterface from "./components/ConfigInterface.tsx";
import Layout from "./components/layout/Layout.tsx";
import ViewIAP from "./components/iaps/ViewIAP.tsx";
import EditIAP from "./components/iaps/EditIAP.tsx";
import {useAuth} from "react-oidc-context";
import {CircularProgress} from "@mui/material";
import {Logout} from "@mui/icons-material";

export default function App() {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div>
                <h2>Inven!RA</h2>
                <CircularProgress/>
            </div>
        );
    }

    if (auth.error) {
        console.log(auth.error);
        return <div>Erro</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <Router>
                <Routes>
                    <Route path="/config-interface" element={<ConfigInterface/>}/>
                    <Route path="/" element={<Layout/>}>
                        <Route index element={<Home/>}/>
                        <Route path="/activities" element={<Activities/>}/>
                        <Route path="/activity-providers" element={<ActivityProviders/>}/>
                        <Route path="/iaps" element={<IAPs/>}/>
                        <Route path="/view-iap" element={<ViewIAP/>}/>
                        <Route path="/edit-iap" element={<EditIAP/>}/>
                        <Route path="/logout" element={<Logout/>}/>
                    </Route>
                </Routes>
            </Router>
        );
    }

    return (
        <div>
            <h2>Inven!RA</h2>
            <button onClick={() => auth.signinRedirect()}>Login</button>
        </div>
    );
}