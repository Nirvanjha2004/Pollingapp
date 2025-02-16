import { Box, Flex, Button, Heading, useColorModeValue } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bg} 
      px={4} 
      position="sticky" 
      top={0} 
      zIndex={10}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex 
        h={16} 
        alignItems="center" 
        justifyContent="space-between"
        maxW="container.md"
        mx="auto"
      >
        <Link to="/">
          <Flex alignItems="center">
            <Heading size="md" color="blue.500">
              Poll App
            </Heading>
          </Flex>
        </Link>

        <Flex gap={4}>
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'solid' : 'ghost'}
              colorScheme="blue"
              size="md"
              transition="all 0.2s"
            >
              Polls
            </Button>
          </Link>
          <Link to="/create">
            <Button
              variant={location.pathname === '/create' ? 'solid' : 'ghost'}
              colorScheme="blue"
              size="md"
              transition="all 0.2s"
            >
              Create Poll
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Navbar;
