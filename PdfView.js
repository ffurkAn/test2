import React,{Component} from 'react';
import {
    StyleSheet, Dimensions, Share, Alert, Platform, Image, WebView, AsyncStorage,
    TouchableOpacity
} from 'react-native';
import PDFView from 'react-native-view-pdf';
import { connect } from 'react-redux';
import {Header} from '../layouts/Header';
import {Text, View} from "native-base";
import IconFontAwesome                                  from 'react-native-vector-icons/FontAwesome5';
import {Localizations} from "../utils/Localization";
import Dialog, {
    DialogTitle,
    DialogFooter,
    DialogButton,
    DialogContent,}             from 'react-native-popup-dialog';
import {downloadDocument}                           from "../actions/SigningActions";



class PdfView extends Component {

    static navigationOptions = {
        header: null,
        headerLeft: null
    };

    constructor(props) {
        super(props);
        this.state = {
            displayHeader:'flex',
            bottom: this.isIphoneXorAbove()?92:58,
            fileSavedDialog: false,

        }
    }

    componentDidMount() {
        if (Dimensions.get('window').width < Dimensions.get('window').height) {
            this.setState({
                displayHeader: 'flex',
                bottom: isIphoneXorAbove() ? 92 : 58
            })
        }
        else {
            this.setState({
                displayHeader: 'none',
                bottom: 0
            })

        }
    }

    isIphoneXorAbove() {
        const dimen = Dimensions.get('window');
        return (
            Platform.OS === 'ios' &&
            !Platform.isPad &&
            !Platform.isTVOS &&
            ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
        );
    }


    downloadDocument(document){
        const { docOid, docName} = this.props;

        this.props.downloadDocument(docOid, docName,  () => {
            this.setState({fileSavedDialog: true});
        });

    }

    askAndDownload(index,value){
        url = PDF_DOWNLOAD_URL+value.showData//+value.showData;
        Alert.alert(
            'Dosya indirilecektir',
            'Onaylıyor musunuz?',
            [
                {text: 'Hayır', style: 'cancel'},
                {text: 'Evet', onPress: () => this.downloadFile(url,value.listData)},
            ],
            { cancelable: false }
        )
    }

    pdfRender(){
        const resourceType = 'base64';
        const base64Content = this.props.base64Doc;

        // todo base64 ?
        if(Platform.OS === 'android' && parseInt(Platform.Version) < 21){
            return(<WebView
                source={{uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}}
                originWhitelist={['*']}
            />)
        }
        else {
            return(<PDFView
                style={styles.pdf}
                onError={(error) => console.log('onError', error)}
                onLoad={() => console.log('PDF rendered from base64')}
                resource={base64Content}
                resourceType={resourceType}/>);
        }
    }

    renderHeader(){
        return(
            <View style = {styles.viewStyle}>
                <TouchableOpacity style={{width:70}} onPress = {() => this.props.navigation.goBack()}>
                    <IconFontAwesome style = {[styles.iconStyle,{paddingLeft:10}]}  name='arrow-left' size={30} color='#777777' />
                </TouchableOpacity>
                <Text style = {styles.imageStyle} >
                    {this.props.docName}
                </Text>
                <TouchableOpacity style={{width:74}} onPress = {() => this.downloadDocument()}>
                    <IconFontAwesome style = {[styles.iconStyle,{paddingLeft:30}]} name='file-download' size={30} color='#777777' />
                </TouchableOpacity>

            </View>
        )
    }

    render() {
        return (
            <View style={[styles.container,{marginBottom:this.state.bottom}]}>
                {this.renderHeader()}
                {this.pdfRender()}
                <Dialog
                    visible={this.state.fileSavedDialog}
                    onTouchOutside={() => {
                        this.setState({ fileSavedDialog: false });
                    }}
                    dialogTitle ={<DialogTitle title={Localizations.FileSaved}/>}
                    footer={
                        <DialogFooter>
                            <DialogButton
                                text={Localizations.BTN_OK_TITLE}
                                onPress={() => {this.setState({ fileSavedDialog: false })}}
                            />
                        </DialogFooter>
                    }
                >
                </Dialog>

            </View>
        )
    }
}

const styles = StyleSheet.create({

    container: {
        backgroundColor: '#808080',
        flex: 1,
        justifyContent: 'flex-start',
    },
    pdf: {
        flex:1,
        backgroundColor: '#808080',
    },
    dropdownStyle: {
        padding:10,
        marginLeft:7,
        marginRight:7,
        marginTop:5,
        backgroundColor:'white'
    },
    imageStyle:{
        height:46,
        resizeMode: 'contain',
        flex:1
    },
    textStyle:{
        fontSize:20
    },
    iconStyle:{
        flex:1,
        paddingTop:10
    },
    viewStyle :{
        flexDirection: 'row',
        backgroundColor : '#bcbcbc',
        height:72,
        justifyContent:'center',
        alignItems:'center',
        paddingTop:22,
        shadowOffset :{
            widht:0,height:2},
        shadowOpacity:0.3
    }
});

function mapStateToProps (state){
    return {
        base64Doc          : state.signing.base64Doc,
        docOid             : state.voting.docOid,
        docName            : state.voting.docName,
    }
}

export default connect(mapStateToProps, {downloadDocument})(PdfView);
