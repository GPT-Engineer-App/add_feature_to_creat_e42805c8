import React, { useState } from "react";
import { Box, Button, Input, Textarea, VStack, HStack, Text, IconButton, useToast } from "@chakra-ui/react";
import { FaPlus, FaTrash, FaSave, FaFolderOpen } from "react-icons/fa";

const Index = () => {
  const [files, setFiles] = useState({ default: {} });
  const [currentFile, setCurrentFile] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const toast = useToast();

  // Handle folder creation
  const createFolder = (parentFolderName = "") => {
    const folderName = window.prompt(`Enter the name of the new folder${parentFolderName ? ` inside ${parentFolderName}` : ""}:`);
    const folderPath = parentFolderName ? `${parentFolderName}/${folderName}` : folderName;
    const newFilesStructure = { ...files };

    if (folderName) {
      const folders = folderPath.split("/").filter(Boolean);
      let currentLevel = newFilesStructure;
      for (const folder of folders) {
        if (!currentLevel[folder]) {
          currentLevel[folder] = {};
        } else if (typeof currentLevel[folder] !== "object") {
          toast({
            title: "Error",
            description: `A file named ${folder} already exists at this location!`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        currentLevel = currentLevel[folder];
      }
      setFiles(newFilesStructure);
      toast({
        title: "Success",
        description: "Folder created!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else if (files[folderName]) {
      toast({
        title: "Error",
        description: "Folder already exists!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Updated file creation to support folders
const createFile = (folderPath = "") => {
    const fileName = window.prompt("Enter the name of the new file (with .txt extension):");
    if (fileName) {
      const folders = folderPath.split("/").filter(Boolean);
      let currentLevel = files;
      for (const folder of folders) {
        currentLevel = currentLevel[folder];
      }

      if (currentLevel && !currentLevel[fileName]) {
        currentLevel[fileName] = "";
        setFiles({ ...files });
        setCurrentFile(`${folderPath}/${fileName}`);
        setCurrentContent("");
        toast({
          title: "Success",
          description: "File created!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "File already exists in this folder!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Handle file selection and update content for the editor
  const openFile = (folderName, fileName) => {
    const fullPath = `${folderName}/${fileName}`;
    setCurrentFile(fullPath);
    setCurrentContent(files[folderName][fileName]);
  };

  // Handle saving the current file
  const saveFile = () => {
    if (currentFile) {
      const [folderName, fileName] = currentFile.split("/");
      if (folderName && fileName && files[folderName]) {
        setFiles((prevFiles) => ({
          ...prevFiles,
          [folderName]: {
            ...prevFiles[folderName],
            [fileName]: currentContent,
          },
        }));
      }
      toast({
        title: "Success",
        description: "File saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle deleting a file
  const deleteFile = (folderName, fileName) => {
    const updatedFolder = { ...files[folderName] };
    delete updatedFolder[fileName];
    const updatedFiles = { ...files, [folderName]: updatedFolder };
    setFiles(updatedFiles);
    if (currentFile === `${folderName}/${fileName}`) {
      setCurrentFile("");
      setCurrentContent("");
    }
  };

  return (
    <VStack spacing={4}>
      <HStack width="100%" padding={4} justifyContent="space-between">
        <Button leftIcon={<FaPlus />} onClick={createFolder}>
          New Folder
        </Button>
        <Button leftIcon={<FaSave />} onClick={saveFile} isDisabled={!currentFile}>
          Save File
        </Button>
      </HStack>
      <HStack width="100%" spacing={4}>
        {/* File Explorer Panel */}
        <VStack width="30%" padding={4} border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="bold">
            Files
          </Text>
          {Object.entries(files).map(([folderName, folderFiles]) => {
            const isFolder = typeof folderFiles === "object";
            const indent = folderName.split("/").length - 1;
            return isFolder ? (
              <Box key={folderName}>
                <Text fontSize="md" fontWeight="bold" pt={2} pb={1} pl={`${indent * 20}px`}>
                  {folderName.split("/").pop()}
                </Text>
                {Object.entries(folderFiles).map(([itemName, itemValue]) =>
                  typeof itemValue === "object" ? (
                    <Text pl={`${(indent + 1) * 20}px`} key={itemName}>
                      {itemName}
                    </Text>
                  ) : (
                    <HStack key={itemName} pl={`${(indent + 1) * 20}px`}>
                      <Button variant="link" onClick={() => openFile(folderName, itemName)}>
                        <FaFolderOpen />
                        <Text pl={2}>{itemName}</Text>
                      </Button>
                      <IconButton aria-label="Delete file" icon={<FaTrash />} size="sm" onClick={() => deleteFile(folderName, itemName)} />
                    </HStack>
                  ),
                )}
                <Button size="sm" leftIcon={<FaPlus />} onClick={() => createFile(folderName)}>
                  Add File
                </Button>
                <Button size="sm" leftIcon={<FaPlus />} onClick={() => createFolder(folderName)}>
                  Add Folder
                </Button>
              </Box>
            ) : null;
          })}
        </VStack>

        {/* Text Editor Panel */}
        <Box width="70%" padding={4} border="1px" borderColor="gray.200">
          {currentFile ? (
            <VStack spacing={4}>
              <Input value={currentFile} isReadOnly />
              <Textarea placeholder="Start typing..." value={currentContent} onChange={(e) => setCurrentContent(e.target.value)} height="400px" />
            </VStack>
          ) : (
            <Text>Select a file to start editing.</Text>
          )}
        </Box>
      </HStack>
    </VStack>
  );
};

export default Index;
