function eraseStorage() {
    chrome.storage.sync.set({"tabs": []})
}

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
            <button className="ui small segment button" onClick={this.props.onClick} style={{width: "100%"}}> 
                <img src={this.props.tab.favIconUrl} style={{height:12, width:12}}/>  
                  
                {this.props.tab.title}
            </button>
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
        chrome.tabs.onRemoved.addListener(function(id, info){
            this.reload()
        }.bind(this))
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
            <div className="ui segments">
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
        chrome.storage.onChanged.addListener(function(changes, areaName){
            this.reload()
        }.bind(this))
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
            <div className="ui segments">
                {buttons}
            </div>
        );
    }
});


var Content = React.createClass({
    render: function() {
        return (
            <div>
                <div className="ui tabular menu">
                    <a className="item" data-tab="stored">Stored tabs</a>
                    <a className="item active" data-tab="active">Active tabs</a>
                </div>
                <div className="ui tab" data-tab="stored">
                    <StoredTabList/>
                </div>
                <div className="ui tab active" data-tab="active">
                    <ActiveTabList/>
                </div>
            </div>
        )   
    },

    componentDidMount: function(){
        $('.menu .item').tab();
    }
})


ReactDOM.render(
    <Content/>,
    document.getElementById('content')
);