import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { title, closeCallback, undo, redo} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar closeCallback={closeCallback}
                             undo={undo}
                             redo={redo}
                />
            </div>
        );
    }
}
