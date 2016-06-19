/**
 * Standalone functions
 * @class Standalone
 */


/**
 * Saves tab to storage.sync
 *
 * @method saveTab
 * @param {Tab} tab Info to save
 */
function saveTab(tab) {
    chrome.storage.sync.get({"tabs": []}, function(data){
        data.tabs.push(tab)
        chrome.storage.sync.set(data)
    })
}

/**
 * Deletes tab from storage.sync
 *
 * @method deleteTab
 * @param {Tab} tab Item to delete - checks .id and .url
 */
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

/**
 * React element for showing one tab
 * @class TabButton
 */

/**
 * Tab info 
 * @property tab {Tab}
 */

/**
 * Function callback called on clicking main button
 * @property onClick {function}
 */

/**
 * Function callback called on clikcking delete button
 * @property onDelete {function}
 */

var TabButton = React.createClass({
    /**
     * Renders this element
     * @method render
     */
    render: function(){
        return (
            <div className="ui segments horizontal button">
                <button className="ui small segment button" onClick={this.props.onClick} style={{width: "100%"}}> 
                    <img src={this.props.tab.favIconUrl} style={{height:15, width:15}}/>  
                      
                    {this.props.tab.title}
                </button>
                <button className="ui segment button right floated" onClick={this.props.onDelete}>
                    <img src="cancel.png" style={{height:15, width:15}}/> 
                </button>
            </div>
        )
    },
})


/**
 * React element for showing list of windows with tabs in them
 * @class ActiveTabList
 */
var ActiveTabList = React.createClass({
    /**
     * Internal list of tabs
     * @private
     * @property tabs
     */

    /**
     * Gets initial state of element
     * @method getInitialState
     */
    getInitialState: function(){
        return {tabs:[]}
    },

    /**
     * Reloads data from cloud storage
     * @method reload
     */
    reload: function(){
        chrome.tabs.query({}, 
            function(tabs) {
                var data = new Array()

                tabs.map(function(tab){
                    if (!(tab.windowId in data)){
                        data[tab.windowId] = new Array()
                    }

                    data[tab.windowId].push(tab)
                })

                this.setState({"tabs": data})
                $('.menu .item').tab();
            }.bind(this)
        )  
    },

    /**
     * Initialy fills component with data and registers listener
     * @function componentDidMount
     */
    componentDidMount: function() {
        this.reload()      
        chrome.tabs.onRemoved.addListener(function(id, info){
            this.reload()
        }.bind(this))
        
    },

    /**
     * Stores tab in cloud storage
     * @method storeTab
     * @param {Tab} tab Info to store
     */
    storeTab: function(tab){
        chrome.tabs.remove(tab.id, function(){
            this.reload()
        }.bind(this))
        saveTab(tab)
    },

    /**
     * Closes tab
     * @method closeTab
     * @param {Tab} tab Info of tab to be closed
     */
    closeTab: function(tab){
        chrome.tabs.remove(tab.id, function(){
            this.reload()
        }.bind(this))
    },

    /**
     * Render this element
     * @method render
     */
    render: function() {
        var headers = new Array()
        var tabs = new Array()

        var window_number = 1

        for (var id in this.state.tabs){
            headers.push(
                <a className="item" data-tab={id}>{"Window " + window_number}</a>
            )

            window_number += 1

            var buttons = this.state.tabs[id].map(function(tab){
                return <TabButton 
                    key={tab.id} 
                    tab={tab} 
                    onClick={this.storeTab.bind(this, tab)} 
                    onDelete={this.closeTab.bind(this, tab)} 
                >
                </TabButton>
            }.bind(this))

            console.log(buttons)

            tabs.push(
                <div className="ui tab segments" data-tab={id}>
                    {buttons}
                </div>
            )
        }

        chrome.windows.getLastFocused(function(win){
            $("[data-tab|='" + win.id + "'").addClass("active")
        })

        return (
            <div>
                <div className="ui tabular menu">
                    {headers}
                </div>
                {tabs}
            </div>
        )
    }
});

/**
 * React element for showing tabs held in storage.sync
 * @class StoredTabList
 */
var StoredTabList = React.createClass({
    /**
     * Internal list of tabs
     * @private
     * @property tabs
     */

    /**
     * Gets initial state of element
     * @method getInitialState
     */
    getInitialState: function(){
        return {tabs:[]}
    },

    /**
     * Reloads data from cloud storage
     * @method reload
     */
    reload: function(){
        chrome.storage.sync.get({tabs: []}, 
            function(data) {
                this.setState({tabs: data.tabs})
            }.bind(this)
        )  
    },

    /**
     * Initialy fills component with data and registers listener
     * @function componentDidMount
     */
    componentDidMount: function() {
        this.reload()      
        chrome.storage.onChanged.addListener(function(changes, areaName){
            this.reload()
        }.bind(this))
    },

    /**
     * Restore tab from cloud storage and erase it
     * @method restoreTab
     * @param {Tab} tab Info about restored tab
     */
    restoreTab: function(tab){
        deleteTab(tab)
        chrome.tabs.create({url: tab.url})
        this.reload()
    },

    /**
     * Helper function to delete tab
     * @method handleDelete
     * @param {Tab} tab Tab to be deleted
     */
    handleDelete: function(tab) {
        deleteTab(tab)
        this.reload()
    },

    /**
     * Render this element
     * @method render
     */
    render: function() {
        var buttons = this.state.tabs.map(function(tab) {
                return (
                    <TabButton 
                        tab={tab} 
                        key={tab.id} 
                        onClick={this.restoreTab.bind(this, tab)} 
                        onDelete={this.handleDelete.bind(this, tab)}
                    >
                    </TabButton>
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



/**
 * Master react element. Holds ActiveTabList and StoredTabList
 * @class Content
 */
var Content = React.createClass({
    /**
     * Render this elemtent
     * @method render
     */
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

    /**
     * Initialize tab logic
     * @method componentDidMount
     */
    componentDidMount: function(){
        $('.menu .item').tab();
    }
})


ReactDOM.render(
    <Content/>,
    document.getElementById('content')
);