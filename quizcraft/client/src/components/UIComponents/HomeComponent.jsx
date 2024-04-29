import NavBar from "./NavBar.jsx";
import {useEffect, useState} from "react";

function HomeComponent({socket}) {
    const [contentValue, setContentValue] = useState("");
    const [textInputValue, setTextInputValue] = useState("");

    // request server data on init
    socket.emit("request-server-data");
    useEffect(() => {
        socket.on ("server-data-response", (data) => {
            setContentValue(data.message);
        })
    }, [socket]);

    // update text area on server data change
    useEffect(() => {
        socket.on ("server-data-changed", (data) => {
            setContentValue(data.message);
        })
    }, [socket]);


    const onTextInputChange = (event) => {
        setTextInputValue(event.target.value); // Update input value on change
    }

    const onSendButtonClick = () => {
        socket.emit("client-speaks", {data: textInputValue});
    }

    return (
        <>
            <NavBar/>

            <h1>Home Component</h1>

            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Contact Your Backend</h5>
                    <p className="card-text">Type a message and send it to the Node.js backed.</p>
                    <div className="mb-3">
                        <input className="input-group-text" value={textInputValue} placeholder="type something..."
                               onChange={onTextInputChange}/>
                    </div>
                    <a href="#" className="btn btn-primary" onClick={onSendButtonClick}>Send Message</a>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Response / Backend Content</h5>
                    <p className="card-text">Here you can see the backend data content.</p>
                    <br/>
                    <div className="mb-3">
                        <label htmlFor="contentTextArea" className="form-label">Backend Content:</label>
                        <textarea className="form-control" id="contentTextArea" rows="3" value={contentValue}
                                  readOnly={true}></textarea>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomeComponent;
