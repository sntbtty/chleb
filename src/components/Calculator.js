import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Fade,
  InputAdornment,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import { initGoogleSheets, fetchIngredients, addIngredient } from '../config/google-sheets';

// Brand colors
const brandColors = {
  primary: '#8B4513', // Warm brown for bread
  secondary: '#556B2F', // Olive green for health/natural
  background: '#FFFFFF', // White background
  paper: '#FFFFFF',
  text: '#2C1810', // Deep warm brown for text
  accent: '#D2691E', // Warm accent color
  error: '#8B0000', // Deep red
  hover: '#F8F8F8' // Light gray for hover states
};

function Calculator() {
  const [open, setOpen] = useState(false);
  const [addIngredientOpen, setAddIngredientOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    calories: '',
    proteins: '',
    fats: '',
    carbs: ''
  });
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalGrams: 0,
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0
  });
  const [addingIngredient, setAddingIngredient] = useState(false);
  const [addError, setAddError] = useState(null);
  const [recipeName, setRecipeName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const initialized = await initGoogleSheets();
        if (!initialized) {
          throw new Error('Не удалось подключиться к Google Sheets');
        }
        
        const fetchedIngredients = await fetchIngredients();
        setIngredients(fetchedIngredients);
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadIngredients();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNameSubmitted(false);
  };

  const handleAddIngredientOpen = () => setAddIngredientOpen(true);
  const handleAddIngredientClose = () => {
    setAddIngredientOpen(false);
    setNewIngredient({
      name: '',
      calories: '',
      proteins: '',
      fats: '',
      carbs: ''
    });
  };

  const handleNewIngredientChange = (field) => (event) => {
    setNewIngredient({
      ...newIngredient,
      [field]: event.target.value
    });
  };

  const handleAddNewIngredient = async () => {
    try {
      setAddingIngredient(true);
      setAddError(null);

      // Validate fields
      if (!newIngredient.name || !newIngredient.calories) {
        throw new Error('Название и калории обязательны');
      }

      // Convert string values to numbers
      const ingredientData = {
        name: newIngredient.name,
        calories: Number(newIngredient.calories) || 0,
        proteins: Number(newIngredient.proteins) || 0,
        fats: Number(newIngredient.fats) || 0,
        carbs: Number(newIngredient.carbs) || 0
      };

      await addIngredient(ingredientData);
      
      // Refresh the ingredients list
      const fetchedIngredients = await fetchIngredients();
      setIngredients(fetchedIngredients);
      
      handleAddIngredientClose();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      setAddError(error.message);
    } finally {
      setAddingIngredient(false);
    }
  };

  const handleIngredientSelect = (ingredient) => {
    setSelectedIngredients([...selectedIngredients, { ...ingredient, grams: 0 }]);
  };

  const handleGramsChange = (index, value) => {
    const newIngredients = [...selectedIngredients];
    newIngredients[index].grams = value === '' ? '' : Number(value);
    setSelectedIngredients(newIngredients);
    calculateTotals(newIngredients);
  };

  const handleRemoveIngredient = (indexToRemove) => {
    const newIngredients = selectedIngredients.filter((_, index) => index !== indexToRemove);
    setSelectedIngredients(newIngredients);
    calculateTotals(newIngredients);
  };

  const calculateTotals = (ingredients) => {
    const totals = ingredients.reduce((acc, ingredient) => {
      const grams = ingredient.grams === '' ? 0 : ingredient.grams;
      const multiplier = grams / 100; // Convert to percentage
      return {
        totalGrams: acc.totalGrams + grams,
        calories: acc.calories + (ingredient.calories * multiplier),
        proteins: acc.proteins + (ingredient.proteins * multiplier),
        fats: acc.fats + (ingredient.fats * multiplier),
        carbs: acc.carbs + (ingredient.carbs * multiplier)
      };
    }, {
      totalGrams: 0,
      calories: 0,
      proteins: 0,
      fats: 0,
      carbs: 0
    });

    setTotals(totals);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setNameSubmitted(true);
  };

  return (
    <Box sx={{ 
      p: 0,
      minHeight: '100vh',
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      bgcolor: brandColors.background,
      color: brandColors.text,
      overflow: 'auto',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <Box sx={{ 
        p: { xs: 2, sm: 4 },
        height: '100%',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: { xs: 3, sm: 4 },
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#8B4513',
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontFamily: '"Roboto Slab", serif'
          }}
        >
          <BakeryDiningIcon sx={{ fontSize: { xs: 28, sm: 35 } }} />
          Калькулятор калорий
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          mb={4}
          sx={{ width: '100%' }}
        >
          <Button 
            variant="contained" 
            onClick={handleOpen}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: 2,
              bgcolor: '#8B4513',
              '&:hover': {
                bgcolor: '#A0522D',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Добавить ингредиенты
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleAddIngredientOpen}
            startIcon={<AddIcon />}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              borderColor: '#8B4513',
              color: '#8B4513',
              '&:hover': {
                borderColor: '#A0522D',
                color: '#A0522D',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
                bgcolor: 'rgba(139, 69, 19, 0.04)'
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Новый ингредиент
          </Button>
        </Stack>

        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Fade}
          transitionDuration={300}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 3,
              bgcolor: brandColors.paper
            }
          }}
        >
          <DialogTitle sx={{ 
            py: 3,
            px: 3,
            bgcolor: brandColors.background,
            borderBottom: `1px solid ${brandColors.primary}`,
            color: brandColors.primary,
            fontFamily: '"Roboto Slab", serif'
          }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 500,
              fontFamily: '"Roboto Slab", serif',
              color: brandColors.primary
            }}>
              {!nameSubmitted ? 'Название блюда' : 'Выберите ингредиенты'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ height: '60vh', p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: brandColors.primary }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            ) : !nameSubmitted ? (
              <Box component="form" onSubmit={handleNameSubmit} sx={{ p: 3 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Введите название блюда"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: brandColors.primary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: brandColors.primary
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: brandColors.primary
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  disabled={!recipeName.trim()}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    bgcolor: brandColors.primary,
                    '&:hover': {
                      bgcolor: brandColors.accent
                    }
                  }}
                >
                  Далее
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: brandColors.primary }}>
                  <TextField
                    fullWidth
                    placeholder="Поиск ингредиентов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: brandColors.primary }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: brandColors.primary
                        }
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: brandColors.primary
                      }
                    }}
                  />
                </Box>
                <List sx={{ height: 'calc(100% - 80px)', overflow: 'auto', pt: 0 }}>
                  {ingredients
                    .filter(ingredient => 
                      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((ingredient, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: brandColors.hover
                          }
                        }}
                      >
                        <ListItemText 
                          primary={
                            <Typography sx={{ 
                              fontWeight: 500,
                              color: brandColors.text
                            }}>
                              {ingredient.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: brandColors.secondary }}>
                              Калории: {ingredient.calories}, Белки: {ingredient.proteins}, 
                              Жиры: {ingredient.fats}, Углеводы: {ingredient.carbs}
                            </Typography>
                          }
                        />
                        <Button 
                          onClick={() => {
                            handleIngredientSelect(ingredient);
                            setSearchTerm('');
                          }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            color: brandColors.primary,
                            '&:hover': {
                              bgcolor: brandColors.hover
                            }
                          }}
                        >
                          Добавить
                        </Button>
                      </ListItem>
                    ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 2, 
            bgcolor: brandColors.background, 
            borderTop: `1px solid ${brandColors.primary}`
          }}>
            {nameSubmitted && (
              <Button 
                onClick={() => setNameSubmitted(false)}
                sx={{ 
                  textTransform: 'none',
                  color: brandColors.primary,
                  '&:hover': {
                    bgcolor: 'rgba(139, 69, 19, 0.04)'
                  }
                }}
              >
                Изменить название
              </Button>
            )}
            <Button 
              onClick={handleClose}
              sx={{ 
                textTransform: 'none',
                color: brandColors.primary,
                '&:hover': {
                  bgcolor: 'rgba(139, 69, 19, 0.04)'
                }
              }}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={addIngredientOpen} 
          onClose={handleAddIngredientClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 3,
              bgcolor: brandColors.paper
            }
          }}
        >
          <DialogTitle sx={{ 
            py: 3,
            px: 3,
            bgcolor: brandColors.background,
            borderBottom: `1px solid ${brandColors.primary}`,
            color: brandColors.primary,
            fontFamily: '"Roboto Slab", serif'
          }}>
            Добавить новый ингредиент
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {addError && (
              <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>
            )}
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Название"
                value={newIngredient.name}
                onChange={handleNewIngredientChange('name')}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: brandColors.primary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.primary
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.primary
                  }
                }}
              />
              <TextField
                label="Калории (на 100г)"
                type="number"
                value={newIngredient.calories}
                onChange={handleNewIngredientChange('calories')}
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: brandColors.primary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.primary
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.primary
                  }
                }}
              />
              <TextField
                label="Белки (на 100г)"
                type="number"
                value={newIngredient.proteins}
                onChange={handleNewIngredientChange('proteins')}
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: brandColors.primary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.primary
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.primary
                  }
                }}
              />
              <TextField
                label="Жиры (на 100г)"
                type="number"
                value={newIngredient.fats}
                onChange={handleNewIngredientChange('fats')}
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: brandColors.primary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.primary
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.primary
                  }
                }}
              />
              <TextField
                label="Углеводы (на 100г)"
                type="number"
                value={newIngredient.carbs}
                onChange={handleNewIngredientChange('carbs')}
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: brandColors.primary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: brandColors.primary
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.primary
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ 
            p: 2, 
            bgcolor: brandColors.background,
            borderTop: `1px solid ${brandColors.primary}`
          }}>
            <Button 
              onClick={handleAddIngredientClose}
              sx={{ 
                textTransform: 'none',
                color: brandColors.primary,
                '&:hover': {
                  bgcolor: 'rgba(139, 69, 19, 0.04)'
                }
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAddNewIngredient} 
              variant="contained"
              disabled={addingIngredient}
              sx={{
                bgcolor: brandColors.primary,
                '&:hover': {
                  bgcolor: brandColors.accent
                },
                textTransform: 'none'
              }}
            >
              {addingIngredient ? 'Добавление...' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

        {selectedIngredients.length > 0 && (
          <Fade in timeout={500}>
            <Paper sx={{ 
              mt: 3, 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: 2,
              bgcolor: brandColors.paper
            }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontWeight: 500,
                  color: brandColors.primary,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  fontFamily: '"Roboto Slab", serif'
                }}
              >
                {recipeName || 'Новое блюдо'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontWeight: 500,
                  color: brandColors.secondary,
                  mb: 3,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Ингредиенты:
              </Typography>
              <Box sx={{ maxHeight: '40vh', overflow: 'auto', mb: 3 }}>
                {selectedIngredients.map((ingredient, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1, sm: 2 },
                      '&:last-child': { mb: 0 },
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: brandColors.hover,
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 1
                      },
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}
                  >
                    <Box sx={{ 
                      flexGrow: 1,
                      width: { xs: '100%', sm: 'auto' },
                      mb: { xs: 1, sm: 0 }
                    }}>
                      <Typography sx={{ 
                        fontWeight: 500, 
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: brandColors.text
                      }}>
                        {ingredient.name}
                      </Typography>
                      <TextField
                        label="Граммы"
                        type="number"
                        value={ingredient.grams}
                        onChange={(e) => handleGramsChange(index, e.target.value)}
                        size="small"
                        inputProps={{
                          min: 0,
                          step: "any"
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            borderColor: brandColors.primary,
                            '&:hover fieldset': {
                              borderColor: brandColors.accent
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: brandColors.primary
                          },
                          width: { xs: '100%', sm: '200px' }
                        }}
                      />
                    </Box>
                    <IconButton 
                      onClick={() => handleRemoveIngredient(index)}
                      sx={{
                        color: brandColors.error,
                        transition: 'transform 0.2s',
                        alignSelf: { xs: 'flex-end', sm: 'center' },
                        '&:hover': {
                          transform: 'scale(1.1)',
                          color: brandColors.error
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ 
                position: 'sticky', 
                bottom: 0, 
                bgcolor: brandColors.paper,
                pt: 3,
                borderTop: 1,
                borderColor: 'divider'
              }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 500,
                    color: brandColors.primary,
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontFamily: '"Roboto Slab", serif'
                  }}
                >
                  {recipeName || 'Новое блюдо'}:
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={6} sm={4}>
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Общий вес: {totals.totalGrams.toFixed(1)} г
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Калории: {totals.calories.toFixed(1)} ккал
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Белки: {totals.proteins.toFixed(1)} г
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Жиры: {totals.fats.toFixed(1)} г
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                      Углеводы: {totals.carbs.toFixed(1)} г
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

export default Calculator; 