import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import PlayerSpace from './components/PlayerSpace/PlayerSpace';
import Chat from './layout/Chat/Chat';

const App = () => (
    <Router>
        <Route path="/" exact component={PlayerSpace} />
        <Route path="/chat" component={Chat} />
    </Router>
);

export default App;
