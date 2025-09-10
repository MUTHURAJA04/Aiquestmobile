// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import DocumentPicker, {
//   types as DocumentPickerTypes,
//   isCancel as isCancelPicker,
// } from "@react-native-documents/picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createSummaryNote } from "../../services/apiClient";

// const inputTypeOptions = [
//   { label: "Text", value: "text" },
//   { label: "URL", value: "url" },
//   { label: "Image", value: "image" },
//   { label: "PDF", value: "pdf" },
//   { label: "Word", value: "word" },
//   { label: "Excel", value: "excel" },
//   { label: "PowerPoint", value: "ppt" },
// ];

// const SummaryGenerate = () => {
//   const [form, setForm] = useState({ type: "", input: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigation = useNavigation();

//   const [credits, setCredits] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [language, setLanguage] = useState("en");
//   const [user, setUser] = useState(null);

//   // Check if user is on trial plan or has no credits
//   const isDisabled = selectedPlan && credits !== null && 
//                     (selectedPlan.title === "TRIAL" || credits <= 0);
  
//   const isFileType = ["image", "pdf", "word", "excel", "ppt"].includes(form.type);

//   useEffect(() => {
//     const loadUserData = async () => {
//       try {
//         // Get user data from storage
//         const userString = await AsyncStorage.getItem("user");
//         if (userString) {
//           const userData = JSON.parse(userString);
//           setUser(userData);
          
//           // Get credits and plan from user data
//           if (userData.subscription) {
//             setSelectedPlan({ title: userData.subscription.plan || "BASIC" });
//             setCredits(userData.subscription.credits || 328); // Default to 328 from your dashboard
//           } else {
//             // If no subscription data, fetch from API
//             try {
//               const token = await AsyncStorage.getItem("userToken");
//               const userId = userData.userId || userData.user_id;
              
//               if (userId && token) {
//                 const response = await apiClient.post("payments/remaining_credits/", {
//                   user_id: userId,
//                   token: token
//                 });
                
//                 if (response.data && response.data.status === 1) {
//                   setCredits(response.data.remaining_credits);
//                   setSelectedPlan({ title: response.data.plan || "BASIC" });
//                 }
//               }
//             } catch (creditError) {
//               console.error("Error fetching credits:", creditError);
//               setSelectedPlan({ title: "BASIC" });
//               setCredits(328); // Fallback to your dashboard value
//             }
//           }
//         }
        
//         // Get language preference
//         const langString = await AsyncStorage.getItem("language");
//         if (langString) setLanguage(langString);
//       } catch (error) {
//         console.error("Error loading user data:", error);
//         // Set defaults based on your dashboard response
//         setSelectedPlan({ title: "BASIC" });
//         setCredits(328);
//       }
//     };

//     loadUserData();
//   }, []);

//   const validate = () => {
//     const newErrors = {};
//     if (!form.type || form.type === "") {
//       newErrors.type = "Please select input type";
//     }
//     if (!form.input || (typeof form.input === "string" && form.input.trim() === "")) {
//       newErrors.input = "Input is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // const handleFilePick = async () => {
//   //   try {
//   //     const res = await DocumentPicker.pickSingle({
//   //       type:
//   //         form.type === "image"
//   //           ? DocumentPickerTypes.images
//   //           : form.type === "pdf"
//   //           ? DocumentPickerTypes.pdf
//   //           : form.type === "word"
//   //           ? [DocumentPickerTypes.doc, DocumentPickerTypes.docx]
//   //           : form.type === "excel"
//   //           ? [DocumentPickerTypes.xls, DocumentPickerTypes.xlsx]
//   //           : form.type === "ppt"
//   //           ? [DocumentPickerTypes.ppt, DocumentPickerTypes.pptx]
//   //           : DocumentPickerTypes.allFiles,
//   //     });
//   //     setForm({ ...form, input: res });
//   //     setErrors((prev) => ({ ...prev, input: "" }));
//   //   } catch (err) {
//   //     if (isCancelPicker(err)) return;
//   //     console.error("File Picker Error:", err);
//   //     Alert.alert("Error", "Failed to pick file");
//   //   }
//   // };

// const handleFilePick = async () => {
//   try {
//     // Define file types based on selection
//     let fileTypes = [];
    
//     switch(form.type) {
//       case "image":
//         fileTypes = [DocumentPickerTypes.images];
//         break;
//       case "pdf":
//         fileTypes = [DocumentPickerTypes.pdf];
//         break;
//       case "word":
//         fileTypes = [DocumentPickerTypes.doc, DocumentPickerTypes.docx];
//         break;
//       case "excel":
//         fileTypes = [DocumentPickerTypes.xls, DocumentPickerTypes.xlsx];
//         break;
//       case "ppt":
//         fileTypes = [DocumentPickerTypes.ppt, DocumentPickerTypes.pptx];
//         break;
//       default:
//         fileTypes = [DocumentPickerTypes.allFiles];
//     }

//     const res = await DocumentPicker.pick({
//       type: fileTypes,
//       allowMultiSelection: false,
//     });

//     if (res && res.length > 0) {
//       const file = res[0];
//       setForm({ ...form, input: file });
//       setErrors((prev) => ({ ...prev, input: "" }));
//       console.log("Selected file:", file);
//     }
//   } catch (err) {
//     if (isCancelPicker(err)) {
//       console.log("User cancelled file picker");
//       return;
//     }
//     console.error("File Picker Error:", err);
//     Alert.alert("Error", "Failed to pick file: " + err.message);
//   }
// };


//   const handleSubmit = async () => {
//     // Check if data is still loading
//     if (credits === null || selectedPlan === null) {
//       Alert.alert("Please wait", "Still loading your data...");
//       return;
//     }

//     if (isDisabled) {
//       Alert.alert("Upgrade Required", "Your plan doesn't allow this feature");
//       return;
//     }

//     if (!validate()) return;

//     try {
//       setLoading(true);

//       // Prepare payload based on input type
//       let payload;
//       if (isFileType) {
//         // For file types
//         payload = {
//           language: language || "en",
//           [form.type]: form.input,
//         };
//       } else {
//         // For text/URL
//         payload = {
//           language: language || "en",
//           [form.type]: form.input.trim(),
//         };
//       }

//       const response = await createSummaryNote(payload, form.type, isFileType);

//       // Update credits if response contains new credit count
//       if (response.remaining_credits !== undefined) {
//         const newCredits = response.remaining_credits;
//         setCredits(newCredits);
        
//         // Update user data in storage with new credits
//         if (user) {
//           const updatedUser = {
//             ...user,
//             subscription: {
//               ...user.subscription,
//               credits: newCredits,
//               plan: selectedPlan.title
//             }
//           };
//           await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
//           setUser(updatedUser);
//         }
//       }

//       // Process the summary response
//       const summaryContent = response.summary || "";
//       const lines = summaryContent.split("\n").filter(Boolean);

//       // Navigate to results screen
//       navigation.navigate("SummaryNoteView", {
//         summary: lines,
//         source: form.input,
//         type: form.type,
//       });
//     } catch (error) {
//       console.error("Error generating summary:", error);
//       Alert.alert("Error", error.message || "Failed to generate summary");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#3590ff" />
//         <Text className="mt-4 text-gray-600">Generating summary...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 bg-gray-100 p-6">
//       <View className="flex-row items-center mb-6">
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text className="text-blue-600 font-bold">← Back</Text>
//         </TouchableOpacity>
//       </View>

//       <View className="bg-white rounded-3xl shadow p-6">
//         <Text className="text-2xl font-bold text-center text-blue-600 mb-6">
//           📝 Generate Summary
//         </Text>

//         {/* Show loading state while checking user data */}
//         {(credits === null || selectedPlan === null) && (
//           <View className="flex-row justify-center items-center mb-4">
//             <ActivityIndicator size="small" color="#3590ff" />
//             <Text className="ml-2 text-gray-600">Checking your plan...</Text>
//           </View>
//         )}

//         {/* Show user's current plan and credits */}
//         {credits !== null && selectedPlan !== null && (
//           <View className="bg-blue-50 p-3 rounded-lg mb-4">
//             <Text className="text-center text-blue-800 font-medium">
//               Plan: {selectedPlan.title} • Credits: {credits}
//             </Text>
//           </View>
//         )}

//         {/* Only show disabled message when user is actually disabled */}
//         {credits !== null && selectedPlan !== null && isDisabled && (
//           <Text className="text-red-500 text-center mb-4">
//             {selectedPlan.title === "TRIAL" 
//               ? "Trial plan doesn't allow this feature" 
//               : `Insufficient credits (${credits} remaining)`}
//           </Text>
//         )}

//         <Text className="font-semibold text-lg mb-2">Select Type</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
//           {inputTypeOptions.map((opt) => (
//             <TouchableOpacity
//               key={opt.value}
//               onPress={() => {
//                 setForm({ type: opt.value, input: "" });
//                 setErrors((prev) => ({ ...prev, type: "" }));
//               }}
//               className={`p-3 rounded-xl mr-2 ${
//                 form.type === opt.value ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-100 border border-gray-200"
//               }`}
//               disabled={credits === null || selectedPlan === null || isDisabled}
//             >
//               <Text
//                 className={`${
//                   form.type === opt.value ? "text-blue-600 font-bold" : "text-gray-700"
//                 } ${(credits === null || selectedPlan === null || isDisabled) ? "opacity-50" : ""}`}
//               >
//                 {opt.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//         {errors.type && <Text className="text-red-500">{errors.type}</Text>}

//         {form.type && (
//           <>
//             <Text className="font-semibold text-lg mt-6 mb-2">
//               {form.type === "text" ? "Enter Text" : 
//                form.type === "url" ? "Enter URL" : 
//                `Upload ${form.type.toUpperCase()} File`}
//             </Text>
            
//             {isFileType ? (
//               <>
//                 <TouchableOpacity
//                   onPress={handleFilePick}
//                   className="bg-gray-200 p-4 rounded-xl mb-2"
//                   disabled={credits === null || selectedPlan === null || isDisabled}
//                 >
//                   <Text className={`text-gray-700 ${(credits === null || selectedPlan === null || isDisabled) ? "opacity-50" : ""}`}>
//                     {form.input?.name ? form.input.name : "Choose File"}
//                   </Text>
//                 </TouchableOpacity>
//                 {errors.input && <Text className="text-red-500">{errors.input}</Text>}
                
//                 {form.type === "image" && form.input?.uri && (
//                   <Image
//                     source={{ uri: form.input.uri }}
//                     className="w-full h-48 mt-4 rounded-xl"
//                     resizeMode="contain"
//                   />
//                 )}
//               </>
//             ) : (
//               <TextInput
//                 className="border border-gray-300 rounded-xl p-4 bg-gray-50"
//                 placeholder={
//                   form.type === "text"
//                     ? "Enter text to summarize..."
//                     : "Paste URL here..."
//                 }
//                 value={form.input}
//                 onChangeText={(val) => {
//                   setForm({ ...form, input: val });
//                   setErrors((prev) => ({ ...prev, input: "" }));
//                 }}
//                 multiline={form.type === "text"}
//                 numberOfLines={form.type === "text" ? 6 : 1}
//                 editable={!(credits === null || selectedPlan === null || isDisabled)}
//               />
//             )}
//             {errors.input && <Text className="text-red-500">{errors.input}</Text>}
//           </>
//         )}

//         <TouchableOpacity
//           onPress={handleSubmit}
//           disabled={credits === null || selectedPlan === null || isDisabled || loading}
//           className={`mt-8 py-4 rounded-full ${
//             credits === null || selectedPlan === null || isDisabled ? "bg-gray-400" : "bg-blue-600"
//           }`}
//         >
//           <Text className="text-center text-white font-bold text-lg">
//             {loading ? "Generating..." : "Generate Summary"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// export default SummaryGenerate;





import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DocumentPicker, {
  types as DocumentPickerTypes,
  isCancel as isCancelPicker,
} from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSummaryNote } from "../../services/apiClient";

const inputTypeOptions = [
  { label: "Text", value: "text" },
  { label: "URL", value: "url" },
  { label: "Image", value: "image" },
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "word" },
  { label: "Excel", value: "excel" },
  { label: "PowerPoint", value: "ppt" },
];

const SummaryGenerate = () => {
  const [form, setForm] = useState({ type: "", input: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [credits, setCredits] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);

  // Check if user is on trial plan or has no credits
  const isDisabled = selectedPlan && credits !== null && 
                    (selectedPlan.title === "TRIAL" || credits <= 0);
  
  const isFileType = ["image", "pdf", "word", "excel", "ppt"].includes(form.type);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from storage
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          // Get credits and plan from user data
          if (userData.subscription) {
            setSelectedPlan({ title: userData.subscription.plan || "BASIC" });
            setCredits(userData.subscription.credits || 328);
          } else {
            setSelectedPlan({ title: "BASIC" });
            setCredits(328);
          }
        } else {
          setSelectedPlan({ title: "BASIC" });
          setCredits(328);
        }
        
        // Get language preference
        const langString = await AsyncStorage.getItem("language");
        if (langString) setLanguage(langString);
      } catch (error) {
        console.error("Error loading user data:", error);
        setSelectedPlan({ title: "BASIC" });
        setCredits(328);
      }
    };

    loadUserData();
    
    // Check and request storage permission on component mount
    checkStoragePermission();
  }, []);

  const checkStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API level 33), we need READ_MEDIA_IMAGES instead of READ_EXTERNAL_STORAGE
        let permissionToCheck = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        let permissionToRequest = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        
        if (Platform.Version >= 33) {
          permissionToCheck = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
          permissionToRequest = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        }
        
        const hasPermission = await PermissionsAndroid.check(permissionToCheck);
        
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(
            permissionToRequest,
            {
              title: "Storage Permission",
              message: "App needs access to your files to select documents",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              "Permission Permanently Denied",
              "Please enable storage permission in app settings to continue",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: openAppSettings }
              ]
            );
          }
          
          setHasStoragePermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          setHasStoragePermission(true);
        }
      } catch (err) {
        console.warn("Permission error:", err);
        setHasStoragePermission(false);
      }
    } else {
      // iOS doesn't require runtime permissions for document picker
      setHasStoragePermission(true);
    }
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings');
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.type || form.type === "") {
      newErrors.type = "Please select input type";
    }
    if (!form.input || (typeof form.input === "string" && form.input.trim() === "")) {
      newErrors.input = "Input is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilePick = async () => {
    try {
      // Check if we have permission
      if (Platform.OS === 'android' && !hasStoragePermission) {
        await checkStoragePermission(); // Re-check permission
        
        if (!hasStoragePermission) {
          Alert.alert(
            "Permission Required", 
            "Please grant storage permission in settings to select files",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: openAppSettings }
            ]
          );
          return;
        }
      }

      // Determine file types based on selected input type
      let fileTypes = [];
      switch (form.type) {
        case "image":
          fileTypes = [DocumentPickerTypes.images];
          break;
        case "pdf":
          fileTypes = [DocumentPickerTypes.pdf];
          break;
        case "word":
          fileTypes = [DocumentPickerTypes.doc, DocumentPickerTypes.docx];
          break;
        case "excel":
          fileTypes = [DocumentPickerTypes.xls, DocumentPickerTypes.xlsx];
          break;
        case "ppt":
          fileTypes = [DocumentPickerTypes.ppt, DocumentPickerTypes.pptx];
          break;
        default:
          fileTypes = [DocumentPickerTypes.allFiles];
      }

      const result = await DocumentPicker.pick({
        type: fileTypes,
        copyTo: "cachesDirectory",
      });

      if (result && result[0]) {
        const file = result[0];
        setForm({
          ...form,
          input: {
            uri: file.uri,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        });
        setErrors((prev) => ({ ...prev, input: "" }));
      }
    } catch (err) {
      if (isCancelPicker(err)) {
        console.log("User cancelled file picker");
        return;
      }
      
      console.error("File Picker Error:", err);
      
      // More specific error messages
      if (err.message && err.message.includes("permission")) {
        Alert.alert(
          "Permission Denied", 
          "Please enable storage permissions in app settings to select files",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openAppSettings }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to pick file: " + err.message);
      }
    }
  };

  const handleSubmit = async () => {
    // Check if data is still loading
    if (credits === null || selectedPlan === null) {
      Alert.alert("Please wait", "Still loading your data...");
      return;
    }

    if (isDisabled) {
      Alert.alert(
        "Upgrade Required", 
        selectedPlan.title === "TRIAL" 
          ? "Your trial plan doesn't allow this feature. Please upgrade to continue." 
          : "You don't have enough credits. Please purchase more to continue."
      );
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      // Prepare payload based on input type
      let payload;
      if (isFileType) {
        // For file types - make sure we're sending the correct file object
        const fileData = {
          uri: form.input.uri,
          name: form.input.name || `file.${form.type}`,
          type: form.input.type || `application/${form.type}`,
        };
        
        payload = {
          language: language || "en",
          [form.type]: fileData,
        };
      } else {
        // For text/URL
        payload = {
          language: language || "en",
          [form.type]: form.input.trim(),
        };
      }

      const response = await createSummaryNote(payload, form.type, isFileType);

      // Update credits if response contains new credit count
      if (response.remaining_credits !== undefined) {
        const newCredits = response.remaining_credits;
        setCredits(newCredits);
        
        // Update user data in storage with new credits
        if (user) {
          const updatedUser = {
            ...user,
            subscription: {
              ...user.subscription,
              credits: newCredits,
              plan: selectedPlan.title
            }
          };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }

      // Process the summary response
      const summaryContent = response.summary || "";
      const lines = summaryContent.split("\n").filter(Boolean);

      // Navigate to results screen
      navigation.navigate("SummaryNoteView", {
        summary: lines,
        source: form.input,
        type: form.type,
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      Alert.alert("Error", error.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3590ff" />
        <Text className="mt-4 text-gray-600">Generating summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 font-bold">← Back</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-3xl shadow p-6">
        <Text className="text-2xl font-bold text-center text-blue-600 mb-6">
          📝 Generate Summary
        </Text>

        {/* Show loading state while checking user data */}
        {(credits === null || selectedPlan === null) && (
          <View className="flex-row justify-center items-center mb-4">
            <ActivityIndicator size="small" color="#3590ff" />
            <Text className="ml-2 text-gray-600">Checking your plan...</Text>
          </View>
        )}

        {/* Show user's current plan and credits */}
        {credits !== null && selectedPlan !== null && (
          <View className="bg-blue-50 p-3 rounded-lg mb-4">
            <Text className="text-center text-blue-800 font-medium">
              Plan: {selectedPlan.title} • Credits: {credits}
            </Text>
          </View>
        )}

        {/* Only show disabled message when user is actually disabled */}
        {credits !== null && selectedPlan !== null && isDisabled && (
          <Text className="text-red-500 text-center mb-4">
            {selectedPlan.title === "TRIAL" 
              ? "Trial plan doesn't allow this feature" 
              : `Insufficient credits (${credits} remaining)`}
          </Text>
        )}

        <Text className="font-semibold text-lg mb-2">Select Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {inputTypeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                setForm({ type: opt.value, input: "" });
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              className={`p-3 rounded-xl mr-2 ${
                form.type === opt.value ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-100 border border-gray-200"
              }`}
              disabled={credits === null || selectedPlan === null || isDisabled}
            >
              <Text
                className={`${
                  form.type === opt.value ? "text-blue-600 font-bold" : "text-gray-700"
                } ${(credits === null || selectedPlan === null || isDisabled) ? "opacity-50" : ""}`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.type && <Text className="text-red-500">{errors.type}</Text>}

        {form.type && (
          <>
            <Text className="font-semibold text-lg mt-6 mb-2">
              {form.type === "text" ? "Enter Text" : 
               form.type === "url" ? "Enter URL" : 
               `Upload ${form.type.toUpperCase()} File`}
            </Text>
            
            {isFileType ? (
              <>
                <TouchableOpacity
                  onPress={handleFilePick}
                  className="bg-gray-200 p-4 rounded-xl mb-2"
                  disabled={credits === null || selectedPlan === null || isDisabled}
                >
                  <Text className={`text-gray-700 ${(credits === null || selectedPlan === null || isDisabled) ? "opacity-50" : ""}`}>
                    {form.input?.name ? form.input.name : "Choose File"}
                  </Text>
                </TouchableOpacity>
                
                {form.input?.name && (
                  <View className="mt-2 mb-2">
                    <Text className="text-sm text-green-600">
                      Selected: {form.input.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Size: {Math.round(form.input.size / 1024)} KB
                    </Text>
                  </View>
                )}
                
                {errors.input && <Text className="text-red-500">{errors.input}</Text>}
                
                {form.type === "image" && form.input?.uri && (
                  <Image
                    source={{ uri: form.input.uri }}
                    className="w-full h-48 mt-4 rounded-xl"
                    resizeMode="contain"
                  />
                )}
              </>
            ) : (
              <TextInput
                className="border border-gray-300 rounded-xl p-4 bg-gray-50"
                placeholder={
                  form.type === "text"
                    ? "Enter text to summarize..."
                    : "Paste URL here..."
                }
                value={form.input}
                onChangeText={(val) => {
                  setForm({ ...form, input: val });
                  setErrors((prev) => ({ ...prev, input: "" }));
                }}
                multiline={form.type === "text"}
                numberOfLines={form.type === "text" ? 6 : 1}
                editable={!(credits === null || selectedPlan === null || isDisabled)}
              />
            )}
            {errors.input && <Text className="text-red-500">{errors.input}</Text>}
          </>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={credits === null || selectedPlan === null || isDisabled || loading}
          className={`mt-8 py-4 rounded-full ${
            credits === null || selectedPlan === null || isDisabled ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Generating..." : "Generate Summary"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SummaryGenerate;