import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import API from './api';
import _ from 'lodash';

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [objFilter, setObjectFilter] = useState({});
  const [list, setList] = useState();
  const [filterPosition, setFilterPosition] = useState([]);
  let filter = `&filter=`;

  useEffect(() => {
    getData(filter, (arr) => setList(arr));
  }, []);

  const onClickItem = (item, isAdd) => {
    let objFilterTemp = { ...objFilter };

    if (!objFilterTemp[item?.type]) {
      objFilterTemp[item?.type] = [];
    }
    if (isAdd) {
      objFilterTemp[item?.type] = [...objFilterTemp[item?.type], item?.value];
    } else {
      objFilterTemp[item?.type] = objFilterTemp[item?.type]?.filter((value) => value !== item?.value);
    }
    setObjectFilter(objFilterTemp);
  };

  const onFilter = () => {
    const listKeys = Object.keys(objFilter);
    const listValues = Object.values(objFilter);
    let stringTemp = '';
    for (let d = 0; d < listKeys.length; d++) {
      if (listValues[d]?.length) {
        // stringTemp = `${stringTemp}${d > 0 ? ',' : ''}{${`"${listKeys[d]}":{"$in":${JSON.stringify(listValues[d])}}}`}`; // or
        stringTemp = `${stringTemp}${d > 0 ? ',' : ''}${`"${listKeys[d]}":{"$in":${JSON.stringify(listValues[d])}}`}`; // and
      }
    }
    const checkFilterPositions = filterPosition?.length === 2 && !filterPosition?.includes('' || NaN);
    // filter = `${filter} {"$or":[${stringTemp}] }`; // or
    filter = `${filter}{${stringTemp}${
      checkFilterPositions
        ? `${stringTemp?.length && checkFilterPositions ? ',' : ''} "position": {"$between" : ${JSON.stringify(
            filterPosition,
          )}}`
        : ''
    }}`; // and
    setIsVisible(false);

    setTimeout(() => {
      getData(filter, (arr) => setList(arr));
      // setObjectFilter({});
    }, 100);
  };

  const onChangeText = _.debounce(
    (text) =>
      searchData(text, (arr) => {
        setList(arr);
      }),
    1000,
  );

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <StatusBar barStyle={'dark-content'} />
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          backgroundColor: 'orange',
          paddingVertical: 10,
        }}>
        <TextInput
          style={{ backgroundColor: 'white', flex: 0.8, borderRadius: 8, marginLeft: 8, paddingHorizontal: 8 }}
          placeholder="Nh???p ????? t??m ki???m"
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
          style={{ flex: 0.2, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 16 }}>L???c</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list || []}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={{ color: 'black', flex: 1, textAlign: 'center', marginVertical: 10 }}>
            Kh??ng t??m th???y ??i???u ki???n ph?? h???p
          </Text>
        )}
      />
      <Modal
        onBackdropPress={() => {
          setTimeout(() => {
            // setObjectFilter({});
            setIsVisible(false);
          }, 100);
        }}
        isVisible={isVisible}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <Text style={{ padding: 10, fontSize: 22, color: 'black' }}>B??? l???c t??m ki???m</Text>
          <SectionList
            sections={DATA}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => <Item item={item} onClickItem={onClickItem} objFilter={objFilter} />}
            renderSectionHeader={({ section: { header } }) => <Text style={styles.header}>{header?.title}</Text>}
            ListFooterComponent={() => {
              return (
                <View>
                  <Text style={styles.header}>{'V??? tr??'}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginVertical: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TextInput
                      placeholder={filterPosition[0]?.toString() || '0'}
                      keyboardType="number-pad"
                      onChangeText={(text) => {
                        const filterPositionTemp = filterPosition;
                        if (!filterPositionTemp[0]) filterPositionTemp[0] = '';
                        filterPositionTemp[0] = parseInt(text);
                        setFilterPosition(filterPositionTemp);
                      }}
                      style={styles.input}
                    />
                    <Text>-</Text>
                    <TextInput
                      placeholder={filterPosition[1]?.toString() || '0'}
                      keyboardType="number-pad"
                      onChangeText={(text) => {
                        const filterPositionTemp = filterPosition;
                        if (!filterPositionTemp[1]) filterPositionTemp[1] = '';
                        filterPositionTemp[1] = parseInt(text);
                        setFilterPosition(filterPositionTemp);
                      }}
                      style={styles.input}
                    />
                  </View>
                </View>
              );
            }}
          />

          <View style={{ flexDirection: 'row', marginVertical: 10, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() => {
                setTimeout(() => {
                  // setObjectFilter({});
                  setIsVisible(false);
                }, 100);
              }}>
              <Text>Hu???</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={onFilter}>
              <Text>??p d???ng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  header: {
    fontSize: 19,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
  },
});

const getData = (filter, onSuccess = () => {}) => {
  API.get(`/category?fields=["$all", {"categories": ["id"]}]${filter}`)
    .then(({ data }) => {
      if (data?.code === 200) {
        const arr = data?.results?.objects?.rows;
        onSuccess(arr);
      }
    })
    .catch((error) => {
      console.log('getData -> error', error);
    });
};

const searchData = (text, onSuccess = () => {}) => {
  API.get(`/category?fields=["$all", {"categories": ["id"]}]&filter={"title" : { "$iLike" : "%25${text}%25" }}`)
    .then(({ data }) => {
      if (data?.code === 200) {
        const arr = data?.results?.objects?.rows;
        onSuccess(arr);
      }
    })
    .catch((error) => {
      console.log('getData -> error', error);
    });
};

const renderItem = ({ item }) => {
  return (
    <View style={{ backgroundColor: 'white', flexDirection: 'row', marginVertical: 10, alignItems: 'center' }}>
      <Image style={{ width: 50, height: 50 }} source={{ uri: item?.image }} />
      <Text style={{ marginLeft: 10 }}>{item?.title}</Text>
      <Text style={{ marginLeft: 10 }}>{item?.is_free ? '-  Mi???n ph??' : '-  T??nh ph??'}</Text>
      <Text style={{ marginLeft: 10 }}>- {item?.position}</Text>
    </View>
  );
};

const Item = ({ item, onClickItem, objFilter }) => {
  const isActive = objFilter[item?.type]?.includes(item?.value);
  const [isClick, setIsClick] = useState(isActive);
  return (
    <TouchableOpacity
      onPress={() => {
        onClickItem(item, !isClick);
        setIsClick(!isClick);
      }}
      style={{
        backgroundColor: isClick ? 'white' : '#ECECEC',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isClick ? '#FCE100' : '#ECECEC',
        marginHorizontal: 10,
      }}>
      <Text style={{ fontSize: 15, color: isClick ? '#FCE100' : 'black' }}>{item?.title}</Text>
    </TouchableOpacity>
  );
};

const DATA = [
  {
    header: { title: 'Th??? lo???i' },
    data: [
      { type: 'category_type', value: 'RABBIT', title: 'Th???' },
      { type: 'category_type', value: 'RUDOLPH', title: 'Tu???n l???c' },
      { type: 'category_type', value: 'HEDGEHOG', title: 'Nh??m' },
      { type: 'category_type', value: 'SQUIRREL', title: 'S??c' },
      { type: 'category_type', value: 'ELEPHANT', title: 'Voi' },
    ],
  },
  {
    header: { title: 'Ti??u ?????' },
    data: [
      { type: 'title', value: 'sub', title: 'sub' },
      { type: 'title', value: 'test', title: 'test' },
      { type: 'title', value: '????????? ??? (?????????) 1', title: '????????? ??? (?????????) 1' },
      { type: 'title', value: '????????? ??????', title: '????????? ??????' },
    ],
  },
  {
    header: { title: 'Gi?? ti???n' },
    data: [
      { type: 'is_free', value: true, title: 'Mi???n ph??' },
      { type: 'is_free', value: false, title: 'T??nh ph??' },
    ],
  },
];
