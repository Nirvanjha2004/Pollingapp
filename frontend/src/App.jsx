import { ChakraProvider, Container, Box, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import PollDetails from './components/PollDetails';
import Navbar from './components/Navbar';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          boxShadow: 'lg',
          rounded: 'lg',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh">
          <Navbar />
          <Container maxW="container.md" py={8}>
            <Box
              bg="white"
              p={6}
              rounded="xl"
              boxShadow="base"
              transition="all 0.2s"
              _hover={{ boxShadow: 'md' }}
            >
              <Routes>
                <Route path="/" element={<PollList />} />
                <Route path="/create" element={<CreatePoll />} />
                <Route path="/poll/:id" element={<PollDetails />} />
              </Routes>
            </Box>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
