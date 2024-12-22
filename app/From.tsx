import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { submitForm } from "@/utils/api";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

type IDateTimePickerProps = React.ComponentProps<typeof DateTimePickerModal>;

export const DatePicker = (props: IDateTimePickerProps): JSX.Element => (
  <DateTimePickerModal mode="time" {...props} />
);

const Form = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    leadDate: new Date(),
    address: {
      address: "",
      country: "",
      postCode: "",
      state: "",
      streetName: "",
      streetNumber: "",
      suburb: "",
    },
  });

  interface address {
    name: string;
    house_number: string;
    road: string;
    neighbourhood: string;
    suburb: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_code: string;
  }

  interface fullAddress {
    place_id: string;
    osm_id: string;
    osm_type: string;
    licence: string;
    lat: string;
    lon: string;
    boundingbox: string[];
    class: string;
    type: string;
    display_name: string;
    display_place: string;
    display_address: string;
    address: address;
  }
  const [searchedAddress, setSearchedAddress] = useState<fullAddress[]>([]);
  const [temAddress, setTempAddress] = useState<string>("");
  const [isAddressListOpen, setIsAddressListOpen] = useState<boolean>(false);
  const [isDatePickertOpen, setIsDatePickertOpen] = useState<boolean>(false);
  const [tempLeadDate, setTempLeadDate] = useState<object>();

  const autoCompleteAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=pk.b01c4396ca4dae74a280ace88e0cbdcc&q=${address}&limit=5`
      );
      const result = await response.json();
      setSearchedAddress(result);
      // console.log('Success:', result);
      return result;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTempAddressChange = (value: string) => {
    autoCompleteAddress(value);
    setTempAddress(value);
  };

  const validateForm = () => {
    if (!formData.firstName) return "First name is required";
    if (!formData.lastName) return "Last name is required";
    if (!formData.email.includes("@")) return "Valid email is required";
    if (!formData.mobile.match(/^\d+$/))
      return "Valid mobile number is required";
    if (!formData.address.country) return "Country is required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    try {
      const data = {
        leadSource: { id: 309 },
        propertyType: { id: 529 },
        ownershipType: { id: 47 },
        ...formData,
      };
      const result = await submitForm(data);
      // console.log("result", result);
      // console.log("formData", formData);
      Alert.alert("Success", "Form submitted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to submit form");
    }
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      style={styles.container}
    >
      <Text style={styles.title}>Solar Secure Enquiry</Text>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={formData.firstName}
        onChangeText={(value) => handleInputChange("firstName", value)}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={formData.lastName}
        onChangeText={(value) => handleInputChange("lastName", value)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
      />

      <Text style={styles.label}>Mobile</Text>
      <TextInput
        style={styles.input}
        value={formData.mobile}
        onChangeText={(value) => handleInputChange("mobile", value)}
      />

      <Text style={styles.label}>Lead Date</Text>

      <View>
        <TextInput
          style={styles.input}
          onPress={() => setIsDatePickertOpen(true)}
          value={moment(tempLeadDate).format("Do MMMM YYYY")}
        />
        <DatePicker
          isVisible={isDatePickertOpen}
          date={new Date()}
          mode="date"
          onConfirm={(date) => {
            setIsDatePickertOpen(false);
            setTempLeadDate(date);
            handleInputChange("leadDate", moment(date).toISOString());
          }}
          onCancel={() => {
            setIsDatePickertOpen(false);
          }}
        />
      </View>

      <Text style={styles.label}>Address</Text>
      <TextInput
        onPress={() => setIsAddressListOpen(true)}
        style={styles.input}
        value={temAddress}
        onChangeText={(value) => handleTempAddressChange(value)}
      />
     
      <>
        {isAddressListOpen && (
          <SafeAreaView style={styles.addressListContainer}>
            <FlatList
              data={searchedAddress}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setTempAddress(item.display_name);
                    setFormData({
                      ...formData,
                      address: {
                        address: item.address.name || "",
                        country: item.address.country || "",
                        postCode: item.address.postcode || "",
                        state: item.address.state || "",
                        streetName: item.address.name || "",
                        streetNumber: item.address.house_number || "",
                        suburb: item.address.suburb || "",
                      },
                    });
                    setIsAddressListOpen(false);
                  }}
                  style={
                    searchedAddress[searchedAddress.length - 1] == item
                      ? styles.addressListItemLast
                      : styles.addressListItem
                  }
                >
                  <Text>{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        )}
      </>

      <Button title="Submit" color="#007BFF" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 36,
    marginBottom: 16,
    color: "#000000",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#000000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  addressListItem: {
    borderBottomWidth: 0.5,
    borderBlockColor: "#808080",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  addressListItemLast: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  addressListContainer: {
    flex:1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default Form;
