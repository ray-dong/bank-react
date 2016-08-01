'use strict';

import React, { 
  AppRegistry,
  Component,
  Text,
  View,
  StatusBar,
  StyleSheet,
  TextInput,
  ListView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';

import Button from 'react-native-button'
import {Scene, Router, TabBar, Modal, Schema, Actions, Reducer} from 'react-native-router-flux'

let styles = require('./styles');
let BankClient = require('./libs/BankClient');
let bc = new BankClient();
let db = require('./libs/RealmDB');  
let dismissKeyboard = require('dismissKeyboard');

var MainContactsView = React.createClass({

    getInitialState: function() {
        dismissKeyboard();
        let contacts = db.objects('Contacts');
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: ds.cloneWithRows(contacts),
        };
    },

    componentDidMount: function() {
        let res = bc.accountGetAll({}, function(res) {
            if (typeof res.error == 'undefined') {
                let contacts = res.response;
                db.write(() => {
                    contacts.forEach(function(c) { 
                        // Check if contact exists
                        let contactDB = db.objects('Contacts').filtered('ContactName == $0 && ContactAccountNumber == $1 && ContactBankNumber == $2', c.AccountHolderName, c.AccountNumber, c.BankNumber);

                        if (contactDB.length == 0) {
                            db.create('Contacts', { ContactName: c.AccountHolderName, ContactAccountNumber: c.AccountNumber, ContactBankNumber: c.BankNumber });
                        }
                    });
                });

            } else {
                // Error
                console.log(res);
            }
        });
    },

    render: function() {
        return (
            <Image source={require('./assets/bg-blur.png')} style={styles.main.backgroundImage}>
            <View style={styles.global.container}>
                <View style={styles.landingPage.smallLogoWrap}>
                    <Image source={require('./assets/logo-sm.png')} style={styles.landingPage.smallLogo} />
                </View>
                  <View style={styles.global.wrap}>
                    <Text style={styles.global.heading}>CONTACTS</Text>
                    <ListView
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) => 
                    <View
                    style={styles.global.contactItem}>
                        <Text onPress={()=>Actions.contact({ data: rowData })} 
                        style={styles.global.contactItemText}>{rowData.ContactName}</Text>
                    </View>}
                    />
                  </View>
            </View>
            </Image>
        )
    }
});

module.exports = MainContactsView;
