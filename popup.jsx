function saveTab(tab) {
    chrome.storage.sync.get({"tabs": []}, function(data){
        data.tabs.push(tab)
        chrome.storage.sync.set(data)
    })
}

function deleteTab(tab) {
    chrome.storage.sync.get({"tabs": []}, function(data){
        var index = data.tabs.lenght + 20

        for (var i=0; i<data.tabs.length; i++){
            if ((data.tabs[i].id === tab.id) && (data.tabs[i].url === tab.url))
                index = i

        }

        data.tabs.splice(index, 1)
        chrome.storage.sync.set(data)
    })
}

var TabButton = React.createClass({
    render: function(){
        return (
            <a className="item" id={this.props.tab.id}> 
                <button className="ui small button" onClick={this.props.onClick}> 
                    <img src={this.props.tab.favIconUrl} height={15} width={15}/>  
                      
                    {this.props.tab.title}
                </button>
            </a>
        )
    },
})

var ActiveTabList = React.createClass({
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
        chrome.tabs.remove(tab.id, function(){
            this.reload()
        }.bind(this))
        saveTab(tab)
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

var StoredTabList = React.createClass({
    getInitialState: function(){
        return {tabs:[]}
    },

    reload: function(){
        chrome.storage.sync.get({tabs: []}, 
            function(data) {
                this.setState({tabs: data.tabs})
            }.bind(this)
        )  
    },

    componentDidMount: function() {
        this.reload()      
    },

    handleClick: function(tab){
        deleteTab(tab)
        chrome.tabs.create({url: tab.url})
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


var Content = React.createClass({
    render: function() {
        return (
            <div className="ui container">
                <h1>Open tabs</h1>
                <ActiveTabList/>
                <br/>
                <h1>Stored tabs</h1>
                <StoredTabList/>
            </div>
        )   
    }
})


ReactDOM.render(
    <Content/>,
    document.getElementById('content')
);

