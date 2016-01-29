var TabButton = React.createClass({
    render: function(){
        return (
            <a className="item" id={this.props.tab.id}> 
                <button className="ui small button" onClick={this.props.onClick}> 
                    <img src={this.props.tab.favIconUrl} height={15} width={15}></img>  
                      
                    {this.props.tab.title}
                </button>
            </a>
        )
    },
})

var TabList = React.createClass({
    getInitialState: function(){
        return {tabs:[]}
    },

    reload: function(){
        chrome.tabs.query({}, 
            function(tabs) {
                this.setState({tabs: tabs})
            }.bind(this)
        )    
    },

    componentDidMount: function() {
        this.reload()      
    },

    handleClick: function(tab){
        chrome.tabs.remove(tab.id)
        this.reload()
    },

    render: function() {
        var buttons = this.state.tabs.map(function(tab) {
                return (
                    <TabButton tab={tab} onClick={this.handleClick.bind(this, tab)}></TabButton>
                )
            }.bind(this)
        )

        return (
            <div className="ui small vertical list">
                {buttons}
            </div>
        );
    }
});

ReactDOM.render(
    <TabList/>,
    document.getElementById('content')
);

