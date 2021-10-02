import React from "react";

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.currentList,
            editActive: false,
        }
    }
    render() {
        var items = []
        var i = 1
        if(this.props.currentList != null)
            for(var key in this.props.currentList.items)
            {
                items.push(<div id={'item'+i} key={i} className='top5-item'>{this.props.currentList.items[key]}</div>);
                i = i+1;
            }
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div> 
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                    <div id="edit-items">
                        {items}
                    </div>
                </div>
            </div>
        )
    }
}
