import React from 'react';
import jsTPS from "./jsTPS.js"
import ChangeItem_Transaction from "./ChangeItem_Transaction.js"
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();
        this.deletelistname="";
        this.tps = new jsTPS();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    deleteList = (index, pair) => {
        this.deletelistindex=index;
        this.deletelistpairindex=pair.key;
        this.deletelistname=pair.name;
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal();
    }

    // confirmed, ready to delete
    deleteList_real = () => {
        this.hideDeleteListModal();
        this.state.sessionData.keyNamePairs.splice(this.deletelistindex,1);
        this.state.sessionData.counter=this.state.sessionData.counter-1
        this.db.mutationUpdateSessionData(this.state.sessionData);
        this.db.mutationDeleteList(this.deletelistpairindex);
        this.setState({
        });
    }

    changeitem(index, newname) {
        var newlist = this.state.currentList;
        let oldText = newlist.items[index-1];
        let transaction = new ChangeItem_Transaction(this, index-1, oldText, newname);
        this.tps.addTransaction(transaction);
        //newlist.items[index-1]=newname;
        //this.db.mutationUpdateList(newlist);
        this.setState({
            currentList: newlist
        });
    }

    changeitemname(index, name) {
        this.state.currentList.items[index]=name;
        this.db.mutationUpdateList(this.state.currentList);
        this.setState({
        });
    }

    undo = ()=> {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
        }
    }

    redo = ()=> {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
        }
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
        this.setState({
        });
        
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }


    componentDidMount(){
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
    }

    onKeyDown = (event) => {
        switch(event.keyCode) {
            case 17:  // control
                this.controlpressed=true;
                console.log("process keyDown", event.charCode, event.keyCode, event.key);
                break
            case 90: // z
                if(this.controlpressed)
                    this.undo();
                break;
            case 89: // y
                if(this.controlpressed)
                    this.redo();
                // console.log("process ctrl-keyDown", event.charCode, event.keyCode, event.key);
                break;
        }
    }

    onKeyUp = (event) => {
        switch(event.keyCode) {
            case 17: // control
                this.controlpressed=false;
                break;
        }   
    } 

    render() {
        return (
            <div id="app-root"> 
                <Banner 
                    title='Top 5 Lister'
                    redo={this.redo}
                    undo={this.undo}
                    closeCallback={this.closeCurrentList} />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList} 
                    changeitem = {this.changeitem.bind(this)}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListRealCallback={this.deleteList_real}
                    deletelistname = {this.deletelistname}
                />
            </div>
        );
    }
}

export default App;
