import { View, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getCredits } from '../../services/apiClient';


const services = [
  {
    title: 'Text to Quiz',
    description: 'Type less. Test more. Let AI turn your text into smart questions.',
    image: require('../../assets/texttoquiz.png'),
    path: "GenerateFromText",
  },
  {
    title: 'Image to Quiz',
    description: 'Upload an image. Unlock instant questions.',
    image: require('../../assets/imagetoquiz.png'),
    path: "GenerateFromImage",
  },
  {
    title: 'Audio to Quiz',
    description: 'Speak it. Hear it. Quiz it.',
    image: require('../../assets/audiotoquiz.png'),
    path: "GenrateFromAudio",
  },
  {
    title: 'Video to Quiz',
    description: 'From screen to sheet — convert any video into a test-ready quiz.',
    image: require('../../assets/videtoquiz.png'),
    path: "GenrateFromVideo",
  },
  {
    title: 'PDF to Quiz',
    description: 'Got a PDF? We’ve got the questions.',
    image: require('../../assets/pdftoquiz.png'),
    path: "GenerateFromPDF",
  },
  {
    title: 'Word to Quiz',
    description: 'Upload your Word file. We’ll take care of the questions.',
    image: require('../../assets/wordtoquiz.png'),
    path: "GenerateFromWord",
  },
  {
    title: 'PPT to Quiz',
    description: 'Turn your slides into smart assessments — instantly.',
    image: require('../../assets/ppttoquiz.png'),
    path: "GenerateFromPPT",
  },
  {
    title: 'Excel to Quiz',
    description: 'From data to questions — let Excel files test your learners.',
    image: require('../../assets/exceltoquiz.png'),
    path: "GenerateFromExcel",
  },
  {
    title: 'URL to Quiz',
    description: 'Paste a link. Get a quiz. It’s that simple.',
    image: require('../../assets/urltoquiz.png'),
    path: "GenerateFromUrl",
  },
  {
    title: 'Wikipedia to Quiz',
    description: 'From facts to flashcards — extract questions straight from Wikipedia.',
    image: require('../../assets/wikipediatoquiz.png'),
    path: "GenerateFromWikipedia",
  },
];

const Services = () => {
  const navigation = useNavigation();
  const [credits, setCredits] = useState(0);

  // Fetch user credits
  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      setCredits(res.remaining_credits || 0);
    } catch (err) {
      
      setCredits(0);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Handle navigation with credit check
  // const handleNavigate = (item) => {
  //   if (!item.path) return;

  //   if (credits > 0) {
  //     navigation.navigate(item.path);
  //   } else {
  //     Alert.alert(
  //       "No Credits Available",
  //       "You have no remaining credits. Please buy a plan to continue.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         {
  //           text: "Go to Plans",
  //           onPress: () =>
  //             Linking.openURL("https://dev.digiaiquest.com/pricing").catch((err) 
               
  //             ),
  //         },
  //       ]
  //     );
  //   }
  // };


  const handleNavigate = (item) => {
  if (!item.path) return;

  // 🔹 If user has 0 credits → block everything
  if (credits <= 0) {
    Alert.alert(
      "No Credits Available",
      "You have no remaining credits. Please buy a plan to continue.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Go to Plans",
          onPress: () =>
            Linking.openURL("https://dev.digiaiquest.com/pricing").catch(() =>
              Alert.alert("Error", "Failed to open pricing page.")
            ),
        },
      ]
    );
    return;
  }

  // 🔹 If user has 1–3 credits → allow only Text to Quiz
  if (credits <= 3) {
    if (item.title === "Text to Quiz") {
      navigation.navigate(item.path);
    } else {
      Alert.alert(
        "No More Credits",
        "Your current free credits allow only the Text to Quiz feature. Buy a plan to unlock all quiz types.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Create Page",
            onPress: () => navigation.navigate("Services"),
          },
        ]
      );
    }
    return;
  }

  // 🔹 Users with >3 credits → allow all
  navigation.navigate(item.path);
};


  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView className="px-6 py-8" contentContainerStyle={{ paddingBottom: 60 }}>
        <Text className="text-3xl font-bold text-blue-900 mb-2 text-center">
          Unlock Learning With AI-Powered Quiz Tools
        </Text>
        <Text className="text-gray-600 text-center mb-6 text-lg">
          Choose your input source and let AI convert it into powerful quizzes.
        </Text>

        {services.map((item, index) => (
          <View
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow py-4"
          >
            <Image
              source={item.image}
              style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 12 }}
              resizeMode="cover"
            />
            <Text className="text-xl font-semibold text-blue-900 mb-2">{item.title}</Text>
            <Text className="text-gray-700 mb-2">{item.description}</Text>
            <TouchableOpacity
              className="items-center bg-blue-500 px-4 py-3 rounded"
              onPress={() => handleNavigate(item)}
            >
              <Text className="text-white font-medium text-sm">Try Now →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Services;
