package auth

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/phuongaz/chatchat/internal/domain/auth"
	"github.com/phuongaz/chatchat/internal/domain/user"
	"github.com/phuongaz/chatchat/internal/dto"
	"github.com/phuongaz/chatchat/pkg/jwt"
)

type authUsecase struct {
	userRepo user.UserRepository
	jwtMaker jwt.JWTMaker
}

func NewAuthUsecase(userRepo user.UserRepository, jwtMaker jwt.JWTMaker) AuthUsecase {
	return &authUsecase{userRepo: userRepo, jwtMaker: jwtMaker}
}

// REGISTER
func (a *authUsecase) Register(req auth.RegisterRequest) error {

	// check user tồn tại
	_, err := a.userRepo.FindByUsername(req.Username)
	if err == nil {
		return errors.New("user already exists")
	}

	// 👉 HASH PASSWORD
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// lưu DB
	err = a.userRepo.Create(user.User{
		Username:            req.Username,
		Password:            string(hashedPassword), // 👈 đã hash
		PublicKey:           req.PublicKey,
		PrivateEncryptedKey: req.PrivateEncryptedKey,
		IV:                  req.IV,
		Salt:                req.Salt,
	})
	if err != nil {
		return err
	}

	return nil
}

// LOGIN
func (a *authUsecase) Login(req dto.LoginRequest) (string, *user.User, error) {

	userFound, err := a.userRepo.FindByUsername(req.Username)
	if err != nil {
		return "", nil, err
	}

	// 👉 SO SÁNH PASSWORD BẰNG BCRYPT
	err = bcrypt.CompareHashAndPassword([]byte(userFound.Password), []byte(req.Password))
	if err != nil {
		return "", nil, errors.New("invalid password")
	}

	// tạo token
	token, err := a.jwtMaker.GenerateToken(userFound.ID, "user", 24*time.Hour)
	if err != nil {
		return "", nil, err
	}

	return token, userFound, nil
}