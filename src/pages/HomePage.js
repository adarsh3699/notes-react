import React, { useState, useEffect } from 'react';
import { apiCall, getLoggedUserId, setLoggedUserId } from "../utils";
import Loader from "../components/Loader";

import "../css/home.css";

import addIcon from "../img/add.png"
import deleteBtn from "../img/delete.png"
import logoutBtn from "../img/logout.png"

const myUserId = getLoggedUserId();

function HomePage() {
    const [isActive, setActive] = useState(false);
    const [msg, setMsg] = useState("");
    const [textInput, setTextInput] = useState("");
    const [list, setList] = useState([]);
    const [flag, setFlag] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isApiLoading, setIsApiLoading] = useState(false);

    useEffect(() => {
        if (!myUserId) {
            document.location.href = "/";
            return;
        } else {
            setIsLoading(false);
            document.title = "Bhemu Notes"
        }
    }, []);

    function handleAddBtnClick(e) {
        setActive(!isActive)
    }

    useEffect(() => {
        (async function() {
            if (myUserId) {
                setIsApiLoading(true);
                const apiResp = await apiCall("notes?userId=" + myUserId);
                if (apiResp.statusCode === 200) {
                    setIsApiLoading(false);
                    setList(apiResp.data)
                } else {
                    setIsApiLoading(false);
                    setMsg(apiResp.msg)
                }
            }
        })();
    }, [flag]);

    async function addNotes(type, notesTitle) {
        setIsApiLoading(true);
        const apiResp = await apiCall("notes?userId=" + myUserId, "post", (type === "todo" ? { notesType: true} : { notesTitle: notesTitle }));
        if (apiResp.statusCode === 200) {
            setFlag(!flag)
            console.log("Notes Added");
            handleNoteClick(apiResp.notesId)
        } else {
            setMsg(apiResp.msg)
        }
    };

    function handleTextInput(e) {
        setTextInput(e.target.value)
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        addNotes("", textInput);
        setTextInput("")
    }

    function handleNoteClick(noteId) {
        window.open("/notes?id=" + noteId, '_blank').focus();
    }

    async function handleDeleteBtnClick(noteId) {
        setIsApiLoading(true)
        const apiResp = await apiCall("notes?noteId=" + noteId, "delete");
        if (apiResp.statusCode === 200) {
            setFlag(!flag)
        } else {
            setMsg(apiResp.msg)
        }
    }

    function handleLogoutBtnClick () {
        setLoggedUserId("");
        document.location.href = "/";
    }

    return (
        <>
            {
                isLoading ? null
                    :
                    <>
                        <form id="bar" onSubmit={handleFormSubmit}>
                            <div id='inputArea'>
                                <input type="text" id="inputBox" autoFocus placeholder="Take a note..." value={textInput} onChange={handleTextInput} />
                            </div>
                            <div id='logoutBox'><img src={logoutBtn} height="28px" id="logoutBtn" onClick={handleLogoutBtnClick} /></div>
                        </form>
                        
                        <div id="background">
                            <div id="msg" style={msg == ""?{ marginTop: "64px"} :null}>{msg}</div>
                            <Loader isLoading={isApiLoading} />

                            <div id="list">
                                {
                                    list.map(function (list) {
                                        return (
                                            <div id={list.notesId} key={list.notesId} onClick={() => handleNoteClick(list.notesId)}>
                                                {list.notesTitle}
                                                <img src={deleteBtn} onClick={(e) => { e.stopPropagation(); handleDeleteBtnClick(list.notesId) }} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>

                        <div id="addButton" >
                            <div id="option" className={isActive ? 'showOption' : null} onClick={(e) => e.stopPropagation()} >
                                <div id="addNotes" onClick={addNotes}>Note</div>
                                <div id="addTodos" onClick={() => addNotes('todo')}>ToDos</div>
                            </div>
                            <div className={isActive ? 'addBtnActive' : null} >
                                <img src={addIcon} height="40px" id="addImg" onClick={handleAddBtnClick}/>
                            </div>
                        </div>
                    </>
            }
        </>
    )
}

export default HomePage;