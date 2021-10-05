import React from "react";

export default class EditToolbar extends React.Component {

    constructor(props) {
        super(props);
        //const { closeCallback, undo, redo} = props;
        this.handleClick=this.handleClick.bind(this);
        this.handleUndo=this.handleUndo.bind(this);
        this.handleRedo=this.handleRedo.bind(this);
    }
    handleClick() {
        this.props.closeCallback();
    }
    handleUndo() {
        this.props.undo();
    }
    handleRedo() {
        this.props.redo();
    }
    render() {
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className="top5-button"
                    onClick={this.handleUndo}   >
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className="top5-button"
                    onClick={this.handleRedo}   >
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className="top5-button"
                    onClick={this.handleClick} >
                        &#x24E7;
                </div>
            </div>
        )
    }
}
