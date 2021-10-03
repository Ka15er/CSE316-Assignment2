import React from "react";

export default class Workspace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.currentList,
            editActive: false,
            editvalue: "",
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleLeave= this.handleLeave.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        event.preventDefault();
    }

    //working
    handleDrag(i, event) {
        this.moveItemSource=i;
    }

    handleDrop(i, event) {
        var arr = this.props.currentList.items;
        arr.splice(i - 1, 1, ...arr.splice(this.moveItemSource - 1, 1, arr[i - 1]));
        this.setState({
        });
        this.dragoverindex=-1;
    }

    handleDragOver(i, event) {
        this.dragoverindex=i;
        event.preventDefault();
        this.setState({
        });
    }

    handleChange(event) {
        this.setState({editvalue: event.target.value});
    }

    edititem(index, e) {
        e.preventDefault();
        this.setState({
            editActive: !this.state.editActive,
            editvalue: this.props.currentList.items[index-1],
        });
        this.modi_index=index;
    }

    handleLeave(event) {
        if (event.key === 'Enter') {
            var newCurrent=this.props.currentList;
            newCurrent.items[this.modi_index-1]=this.state.editvalue;
            this.setState({
                text: newCurrent,
                editActive: false,
            });
        }
    }

    render() {
        var items = []
        var i = 1
        if(this.props.currentList!=null){
            for(var key in this.props.currentList.items)
            {
                if(i===this.modi_index && this.state.editActive) {
                items.push(<div id={'item'+i} key={i} draggable="true"
                                className={i===this.dragoverindex?'top5-item-dragged-to':'top5-item'} 
                                onDoubleClick={this.edititem.bind(this,i)}
                                onDrag={this.handleDrag.bind(this,i)}
                                onDragOver={this.handleDragOver}
                                onDrop={this.handleDrop.bind(this,i)}>
                                <input type="text" 
                                    id={'item-text-input-'+i} 
                                    key={'item-text-input-'+i}
                                    value={this.state.editvalue}
                                    onKeyDown={this.handleLeave}
                                    onChange={this.handleChange}/> 
                           </div>);
                } else {
                items.push(<div id={'item'+i} key={i} draggable="true"
                                className={i===this.dragoverindex?'top5-item-dragged-to':'top5-item'} 
                                onClick={this.handleClick}
                                onDoubleClick={this.edititem.bind(this,i)}
                                onDrag={this.handleDrag.bind(this,i)}
                                onDragOver={this.handleDragOver.bind(this,i)}
                                onDrop={this.handleDrop.bind(this,i)}>
                               {this.props.currentList.items[key]}</div>);
                }
                i = i+1;
            }
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
        );
    }
}
